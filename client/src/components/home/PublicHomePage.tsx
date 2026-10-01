'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { SocietyEvent } from '@/types';
import { SOCIETY_NAME, SOCIETY_TAGLINE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Bell,
  CalendarDays,
  AlertTriangle,
  Wrench,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  MapPin,
  Clock,
  Users,
  Shield,
  Zap,
  ChevronRight,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Droplets,
  Leaf,
  Home,
  Waves,
  TreePine,
  Phone,
} from 'lucide-react';

// ─── Curated Unsplash images (free-to-use, no attribution required in apps) ───
const HERO_IMG =
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=80';
const SOCIETY_IMG_1 =
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80';
const SOCIETY_IMG_2 =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
const SOCIETY_IMG_3 =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80';
const SOCIETY_IMG_4 =
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80';
const COMMUNITY_IMG =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

export default function PublicHomePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<SocietyEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Fetch real events from backend (graceful if unauthenticated)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setEventsLoading(true);
        const res = await api.get('/events');
        if (mounted && res.data?.success && Array.isArray(res.data.data)) {
          setEvents(res.data.data);
        }
      } catch {
        // Silently handle — events section shows empty state
      } finally {
        if (mounted) setEventsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* ─── Nav links ─── */
  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Events', href: '#events' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#footer' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">

      {/* ═══════════════════════════════════════════════════
          1. NAVBAR
          ═══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center shadow-md border border-teal-600/30 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                  {SOCIETY_NAME}
                </span>
                <span className="text-[11px] font-semibold text-teal-700 tracking-wide uppercase leading-none">
                  {SOCIETY_TAGLINE}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-teal-800 rounded-lg hover:bg-teal-50/60 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2.5">
              {isAuthenticated ? (
                <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-sm">
                  <Link href="/maintenance" className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Resident Portal</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-sm px-4">
                  <Link href="/login" className="flex items-center gap-1.5">
                    <LogIn className="w-4 h-4" />
                    <span>Login / Register</span>
                  </Link>
                </Button>
              )}

              {/* Mobile Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-5 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Button asChild className="w-full bg-teal-700 hover:bg-teal-800 text-white">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="w-4 h-4 mr-2" /> Resident Login
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <UserPlus className="w-4 h-4 mr-2" /> Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════
          2. HERO — Full-width building image, left text overlay
          ═══════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-[520px] lg:min-h-[600px] overflow-hidden">
        {/* Background Image — ONE strong residential building */}
        <div className="absolute inset-0">
          <Image
            src={HERO_IMG}
            alt="Atharva Society — Modern Residential Community"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Dark gradient from left for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-[520px] lg:min-h-[600px]">
          <div className="max-w-xl py-16 sm:py-20 lg:py-24 space-y-6">
            {/* Pill badges */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-semibold text-teal-300 uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3" /> Smart Living
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3" /> Safe Community
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3" /> Better Tomorrow
              </span>
            </div>

            <div>
              <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-2">
                Welcome to
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white tracking-tight leading-[1.1]">
                {SOCIETY_NAME}
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-white/90 mt-2">
                Your Society, Simplified.
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              Manage your society activities, stay updated with notices,
              raise complaints, pay maintenance dues, and connect with your
              community — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                asChild
                size="lg"
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-7 shadow-lg shadow-teal-900/40"
              >
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-6"
              >
                <Link href="/register" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          3. FEATURE BADGES STRIP — below hero
          ═══════════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Safe Environment</p>
                <p className="text-[11px] text-slate-500">24/7 gate security & SOS</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Modern Amenities</p>
                <p className="text-[11px] text-slate-500">Well-maintained infrastructure</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Active Community</p>
                <p className="text-[11px] text-slate-500">Events, festivals & meetups</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <TreePine className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Green Surroundings</p>
                <p className="text-[11px] text-slate-500">Clean & maintained campus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          4. OUR SOCIETY + IMAGE COLLAGE + EVENTS SIDEBAR
          ═══════════════════════════════════════════════════ */}
      <section id="about" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

            {/* LEFT COLUMN — Our Society text + Image Grid */}
            <div className="lg:col-span-8 space-y-8">
              {/* Header */}
              <div className="space-y-2 max-w-lg">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Our Society
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  More than just a place to live
                </p>
                <p className="text-slate-600 text-sm leading-relaxed pt-1">
                  Atharva Society is a well-planned residential community with modern amenities
                  and a family-friendly environment. We bring people together, create lasting
                  connections and build a better tomorrow for every resident family.
                </p>
              </div>

              {/* Image Collage Grid */}
              <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[340px] sm:h-[400px]">
                {/* Large image — spans 2 cols, 2 rows */}
                <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-md group">
                  <Image
                    src={COMMUNITY_IMG}
                    alt="Atharva Society Campus"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-semibold">
                    <Home className="w-3.5 h-3.5" />
                    <span>Our Beautiful Campus</span>
                  </div>
                </div>
                {/* Top-right image */}
                <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden shadow-md group">
                  <Image
                    src={SOCIETY_IMG_1}
                    alt="Community Living"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-white text-[10px] font-semibold">
                    <Waves className="w-3 h-3" />
                    <span>Community Living</span>
                  </div>
                </div>
                {/* Top-right-right */}
                <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden shadow-md group">
                  <Image
                    src={SOCIETY_IMG_2}
                    alt="Modern Homes"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-white text-[10px] font-semibold">
                    <Building2 className="w-3 h-3" />
                    <span>Modern Homes</span>
                  </div>
                </div>
                {/* Bottom-right */}
                <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden shadow-md group">
                  <Image
                    src={SOCIETY_IMG_3}
                    alt="Society Amenities"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-white text-[10px] font-semibold">
                    <Leaf className="w-3 h-3" />
                    <span>Green Spaces</span>
                  </div>
                </div>
                {/* Bottom-right-right */}
                <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden shadow-md group">
                  <Image
                    src={SOCIETY_IMG_4}
                    alt="Peaceful Gardens"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-white text-[10px] font-semibold">
                    <TreePine className="w-3 h-3" />
                    <span>Landscaped Gardens</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Upcoming Events Sidebar */}
            <div id="events" className="lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-24">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
                  <Link
                    href="/login"
                    className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-0.5"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {eventsLoading ? (
                    <div className="py-12 text-center">
                      <div className="w-7 h-7 rounded-full border-[3px] border-teal-100 border-t-teal-700 animate-spin mx-auto" />
                      <p className="text-[11px] text-slate-400 mt-2">Loading events...</p>
                    </div>
                  ) : events.length > 0 ? (
                    events.slice(0, 4).map((evt) => {
                      const d = new Date(evt.event_date);
                      const day = d.getDate();
                      const monthStr = d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
                      return (
                        <div key={evt._id} className="flex items-start gap-3.5 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                          {/* Date badge */}
                          <div className="shrink-0 w-12 h-14 rounded-xl bg-teal-50 border border-teal-200 flex flex-col items-center justify-center">
                            <span className="text-lg font-extrabold text-teal-800 leading-none">{day}</span>
                            <span className="text-[10px] font-bold text-teal-600 uppercase">{monthStr}</span>
                          </div>
                          {/* Info */}
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-bold text-slate-900 leading-snug truncate">{evt.title}</p>
                            {evt.event_time && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {evt.event_time}
                              </p>
                            )}
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {evt.location || 'Society Premises'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 px-5 text-center space-y-2">
                      <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">No Upcoming Events</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Festivals, AGMs, and community events will appear here once posted by the committee.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. FEATURES / FACILITIES SECTION
          ═══════════════════════════════════════════════════ */}
      <section id="features" className="py-16 lg:py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <p className="text-teal-700 text-xs font-bold uppercase tracking-widest">
              Facilities & Services
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything Your Society Needs
            </h2>
            <p className="text-slate-600 text-sm">
              All core features designed for Atharva Society residents, committee members, and estate staff.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Maintenance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Maintenance & Bills</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pay monthly dues online via Razorpay, view payment history, and download branded PDF receipts.
              </p>
            </div>

            {/* Notices */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Notices & Circulars</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Official notices for water supply, power outages, lift servicing, meetings, and regulations.
              </p>
            </div>

            {/* Events */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Events & Festivals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ganpati, Diwali celebrations, sports tournaments, cultural programs, and society AGMs.
              </p>
            </div>

            {/* Emergency */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Emergency & Lift SOS</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                One-tap society-wide SOS alerts, official emergency helplines, and lift rescue support.
              </p>
            </div>

            {/* Society Services */}
            <div id="services" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Society Services</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified electricians, plumbers, carpenters, housekeeping, and security contacts.
              </p>
            </div>

            {/* Society Assets */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Society Assets</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track CCTV cameras, fire extinguishers, projectors, furniture, and common equipment.
              </p>
            </div>

            {/* Complaints */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Complaints</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit plumbing, electrical, or cleanliness issues and track resolution progress.
              </p>
            </div>

            {/* Gate Security */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Gate & Security</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Watchman portal for visitor logs, delivery verification, and gate emergency alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. CALL TO ACTION BANNER
          ═══════════════════════════════════════════════════ */}
      <section className="relative py-16 bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src={HERO_IMG} alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Are You a Resident of {SOCIETY_NAME}?
          </h2>
          <p className="text-teal-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Access your resident dashboard to pay monthly maintenance, view circulars,
            raise complaints, or connect with emergency services.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <Button asChild size="lg" className="bg-white text-teal-900 hover:bg-teal-50 font-bold px-7 shadow-lg">
              <Link href="/login">Sign In to Resident Portal</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 hover:bg-white/10 text-white font-bold px-6"
            >
              <Link href="/register">Register New Flat</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          7. CLEAN PROFESSIONAL FOOTER
          ═══════════════════════════════════════════════════ */}
      <footer id="footer" className="bg-slate-950 text-slate-400 text-xs pt-14 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-slate-800/80">

            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-white font-bold text-base">{SOCIETY_NAME}</span>
              </div>
              <p className="text-teal-400 text-[11px] font-semibold uppercase tracking-wider">
                {SOCIETY_TAGLINE}
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                A modern residential society management platform dedicated to safety,
                transparency, and community harmony.
              </p>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-3">
              <p className="text-white font-bold text-xs uppercase tracking-wider">Navigation</p>
              <ul className="space-y-2">
                <li><Link href="#hero" className="hover:text-teal-400 transition-colors">Home</Link></li>
                <li><Link href="#about" className="hover:text-teal-400 transition-colors">About Society</Link></li>
                <li><Link href="#features" className="hover:text-teal-400 transition-colors">Features</Link></li>
                <li><Link href="#events" className="hover:text-teal-400 transition-colors">Events</Link></li>
              </ul>
            </div>

            {/* Resident Portal */}
            <div className="space-y-3">
              <p className="text-white font-bold text-xs uppercase tracking-wider">Resident & Staff</p>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-teal-400 transition-colors">Resident Login</Link></li>
                <li><Link href="/register" className="hover:text-teal-400 transition-colors">Register Flat</Link></li>
                <li><Link href="/manager-setup" className="hover:text-teal-400 transition-colors">Manager Setup</Link></li>
                <li><Link href="/forgot-password" className="hover:text-teal-400 transition-colors">Forgot Password</Link></li>
              </ul>
            </div>

            {/* Emergency & Location */}
            <div className="space-y-3">
              <p className="text-white font-bold text-xs uppercase tracking-wider">Emergency Helplines</p>
              <ul className="space-y-1.5 text-[11px]">
                <li>Police: <span className="text-white font-semibold">100</span></li>
                <li>Ambulance: <span className="text-white font-semibold">102 / 108</span></li>
                <li>Fire Station: <span className="text-white font-semibold">101</span></li>
                <li>National Helpline: <span className="text-white font-semibold">112</span></li>
              </ul>
              <div className="pt-2 flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>{SOCIETY_NAME}, Pune, Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
            <p>&copy; {new Date().getFullYear()} {SOCIETY_NAME}. All rights reserved.</p>
            <p>{SOCIETY_NAME} &mdash; {SOCIETY_TAGLINE}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
