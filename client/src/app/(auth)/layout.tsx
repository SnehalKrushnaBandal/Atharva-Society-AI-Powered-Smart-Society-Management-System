import Link from 'next/link';
import { SOCIETY_NAME, SOCIETY_TAGLINE } from '@/lib/constants';
import { Building2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      {/* Auth Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center shadow-sm border border-teal-600/30 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                  {SOCIETY_NAME}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-teal-700 tracking-wide uppercase leading-none">
                  {SOCIETY_TAGLINE}
                </span>
              </div>
            </Link>

            {/* Back to Home Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-teal-800 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 text-teal-700" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area — Centered Compact Auth Card */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg mx-auto">
          {children}
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="py-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>© {new Date().getFullYear()} {SOCIETY_NAME}. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700 inline" />
            <span>Secured Residential Portal</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
