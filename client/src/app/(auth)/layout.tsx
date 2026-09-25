import { SOCIETY_NAME, SOCIETY_TAGLINE, PROJECT_FULL_NAME } from '@/lib/constants';
import {
  Building2,
  Users,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  CreditCard,
  PhoneCall,
  Flame,
} from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 flex">
      {/* Left Side - Community Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 relative overflow-hidden flex-col justify-between p-12 xl:p-16 text-white border-r border-slate-800">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl"></div>
        </div>

        {/* Header Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25 border border-teal-400/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{SOCIETY_NAME}</h1>
              <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider">{SOCIETY_TAGLINE}</p>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 my-auto py-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Resident Community Platform
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            A Safe, Connected, & Vibrant Society Living Experience
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Manage flat dues, access gate security, join festive community gatherings, report maintenance complaints, and connect with society services seamlessly.
          </p>

          {/* Community Visual Highlights */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Maintenance Dues</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant online receipts & breakdown</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Events & Festivals</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Diwali, Ganpati & cultural meetups</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Gate & Security</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Visitor logs & lift emergency SOS</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Society Notices</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Water, power & committee circulars</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>{SOCIETY_NAME} • Pune, Maharashtra</span>
          <span>Version 2.0 • Secured</span>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-10">
        {/* Mobile Header */}
        <div className="lg:hidden text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-lg shadow-teal-700/20 mb-2 border border-teal-500/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{SOCIETY_NAME}</h1>
          <p className="text-xs text-teal-700 font-medium">{SOCIETY_TAGLINE}</p>
        </div>

        {/* Auth Form Card Container */}
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
