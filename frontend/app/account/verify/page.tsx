'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { readApiError } from '@/lib/api-error';

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
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(readApiError((data as any)?.detail) || 'Verification failed');

        router.push('/account/verified');
      } catch (err) {
        setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
      }
    };

    doVerify();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero p-4 dark:bg-navy-deeper">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-line bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-[#0B1331]">
        {errorMsg ? (
          <>
            <AlertCircle size={40} className="mx-auto text-red-500" />
            <h2 className="text-xl font-bold text-navy-text dark:text-white">Verification Failed</h2>
            <p className="text-xs font-semibold text-red-600">{errorMsg}</p>
          </>
        ) : (
          <>
            <Loader2 size={40} className="mx-auto animate-spin text-royal" />
            <h2 className="text-xl font-bold text-navy-text dark:text-white">Verifying Email Address...</h2>
            <p className="text-xs text-bodytext">Please wait while we confirm your account details.</p>
          </>
        )}
      </div>
    </div>
  );
}