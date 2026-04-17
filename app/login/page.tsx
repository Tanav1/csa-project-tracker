'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#FFF8F1' }}>
      {/* Logo */}
      <div className="mb-12 flex flex-col items-center gap-3">
        <div className="text-3xl font-bold" style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}>
          savvy
        </div>
        <p className="font-caption text-xs tracking-widest uppercase" style={{ color: '#89837C' }}>
          CSA Efficiency Dashboard
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-lg border p-8 flex flex-col gap-6" style={{ borderColor: '#ECECEC' }}>
        <div>
          <h1 className="text-xl font-bold text-black mb-1" style={{ fontFamily: 'Diatype, sans-serif' }}>
            Sign in
          </h1>
          <p className="text-sm" style={{ color: '#767676' }}>
            Access requires a <span className="font-medium text-black">@savvywealth.com</span> or{' '}
            <span className="font-medium text-black">@savvyadvisors.com</span> account.
          </p>
        </div>

        {(error === 'AccessDenied' || error === 'Callback') && (
          <div className="text-sm px-3 py-2 rounded" style={{ backgroundColor: '#FEE2E2', color: '#B63D35' }}>
            Only @savvywealth.com and @savvyadvisors.com accounts can access this dashboard.
          </div>
        )}
        {error && error !== 'AccessDenied' && error !== 'Callback' && (
          <div className="text-sm px-3 py-2 rounded" style={{ backgroundColor: '#FEE2E2', color: '#B63D35' }}>
            Authentication failed: <code>{error}</code>
          </div>
        )}

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded text-white text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#175242', fontFamily: 'Diatype, sans-serif' }}
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>

      <p className="mt-6 text-xs" style={{ color: '#B2AAA1' }}>
        Savvy Wealth · Internal Tools
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#FFF8F1' }} />}>
      <LoginContent />
    </Suspense>
  )
}
