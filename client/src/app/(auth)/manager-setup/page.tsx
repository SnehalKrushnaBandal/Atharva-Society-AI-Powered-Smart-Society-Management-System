'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FLAT_NUMBERS, SOCIETY_NAME } from '@/lib/constants';
import {
  Crown,
  Shield,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import api from '@/lib/api';

export default function ManagerSetupPage() {
  const router = useRouter();
  const { managerSetup, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    flat_no: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [managerExists, setManagerExists] = useState<boolean | null>(null);

  // Check if manager already exists
  useEffect(() => {
    const checkManager = async () => {
      try {
        const response = await api.get('/auth/manager-exists');
        const exists = response.data.data?.exists;
        setManagerExists(exists);
        if (exists) {
          // Manager already exists, redirect to login
          router.push('/login');
        }
      } catch (err) {
        console.error('Error checking manager:', err);
        setManagerExists(false);
      }
    };
    checkManager();
  }, [router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const { name, email, password, confirmPassword, flat_no, phone } = formData;

    if (!name || !email || !password || !confirmPassword || !flat_no || !phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const result = await managerSetup({
        name,
        email,
        password,
        flat_no,
        phone,
      });

      if (result.success) {
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking status
  if (authLoading || managerExists === null) {
    return (
      <Card className="border border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-amber-100 border-t-amber-600 animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Checking society manager status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If manager exists, show message (will redirect)
  if (managerExists) {
    return (
      <Card className="border border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl">
        <CardContent className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Manager already registered for {SOCIETY_NAME}.</p>
          <p className="text-xs text-slate-500">Redirecting to login portal...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 pb-4 border-b border-slate-100 bg-amber-50/40">
        <div className="flex items-center justify-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
            <Crown className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-slate-900 tracking-tight">First Manager Setup</CardTitle>
        <CardDescription className="text-center text-slate-600 text-xs">
          Register the primary Committee Administrator account for {SOCIETY_NAME}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3.5 pt-4">
          <Alert className="border-amber-200 bg-amber-50/80 text-amber-900 py-2.5">
            <AlertDescription className="text-xs font-medium">
              👑 Welcome! As the first user, your account will be granted Manager access to configure society billing, assets, users, and announcements.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50/80 text-red-700 py-2.5">
              <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-slate-700 font-semibold text-xs">Manager Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="name"
                type="text"
                placeholder="e.g. Committee Chairman Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
                className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-amber-600 focus:ring-amber-600 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-semibold text-xs">Official Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="manager@athardasociety.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
                className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-amber-600 focus:ring-amber-600 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="flat_no" className="text-slate-700 font-semibold text-xs">Your Flat Number *</Label>
              <Select
                value={formData.flat_no}
                onValueChange={(value) => handleChange('flat_no', value)}
                disabled={loading}
              >
                <SelectTrigger id="flat_no" className="h-10 bg-slate-50/50 border-slate-200 text-sm">
                  <SelectValue placeholder="Select flat" />
                </SelectTrigger>
                <SelectContent>
                  {FLAT_NUMBERS.map((flat) => (
                    <SelectItem key={flat} value={flat}>
                      Flat {flat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-slate-700 font-semibold text-xs">Mobile Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={loading}
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-amber-600 focus:ring-amber-600 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-xs">Admin Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={loading}
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-amber-600 focus:ring-amber-600 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-xs">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-amber-600 focus:ring-amber-600 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3.5 pt-2 pb-6">
          <Button
            type="submit"
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-600/20 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up manager...
              </>
            ) : (
              <>
                Initialize Manager Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-600">
            Already have a manager account?{' '}
            <Link
              href="/login"
              className="text-amber-700 font-bold hover:text-amber-800 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
