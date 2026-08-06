'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('No verification token provided.');
      return;
    }

    const doVerify = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Verification failed');

        router.push('/account/verified');
      } catch (err) {
        setErrorMsg((err as Error).message);
      }
    };

    doVerify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl space-y-4">
        {errorMsg ? (
          <>
            <AlertCircle size={40} className="mx-auto text-red-500" />
            <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
          </>
        ) : (
          <>
            <Loader2 size={40} className="mx-auto text-blue-600 animate-spin" />
            <h2 className="text-xl font-bold text-slate-900">Verifying Email Address...</h2>
            <p className="text-xs text-slate-500">Please wait while we confirm your account details.</p>
          </>
        )}
      </div>
    </div>
  );
}
