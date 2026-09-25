import logging
import random
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from config.settings import settings

logger = logging.getLogger(__name__)


def generate_otp(length: int = 6) -> str:
    return "".join(random.choice("0123456789") for _ in range(length))


def _to_msg91_mobile(phone: str) -> str:
    mobile = phone.strip().replace("+", "").replace(" ", "").replace("-", "")
    if mobile.startswith("0"):
        mobile = mobile[1:]
    if not mobile.startswith("91"):
        mobile = "91" + mobile
    return mobile


def send_otp_sms(phone: str, otp: str) -> tuple:
    """Send an OTP SMS via Msg91.

    Returns (sent_via, dev_code) where sent_via is "msg91" or "dev".
    dev_code is only returned when MSG91_AUTH_KEY is not configured
    (development mode) so the flow can be tested without using credits.
    """
    if not settings.MSG91_AUTH_KEY:
        logger.warning("MSG91_AUTH_KEY not set — dev mode, OTP for %s is %s", phone, otp)
        return ("dev", otp)

    mobile = _to_msg91_mobile(phone)
    params = {
        "authkey": settings.MSG91_AUTH_KEY,
        "template_id": settings.MSG91_OTP_TEMPLATE_ID,
        "mobile": mobile,
        "otp": otp,
        "otp_length": str(len(otp)),
        "otp_expiry": str(settings.OTP_EXPIRY_MINUTES),
        "sender": settings.MSG91_SENDER_ID,
    }
    url = "https://control.msg91.com/api/v5/otp?" + urlencode(params)
    req = Request(url, method="POST")
    try:
        with urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8", "ignore")
        if resp.status != 200:
            logger.error("Msg91 send failed: %s %s", resp.status, body)
            raise RuntimeError("SMS gateway error")
        return ("msg91", None)
    except Exception as exc:
        logger.error("Msg91 transport error: %s", exc)
        raise