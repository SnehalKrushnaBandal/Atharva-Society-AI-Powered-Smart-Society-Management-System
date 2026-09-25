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
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  ShieldCheck,
  Home,
  UserCheck,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    flat_no: '',
    phone: '',
    category: 'owner', // 'owner' | 'tenant' | 'watchman'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingManager, setCheckingManager] = useState(true);

  // Check if manager exists, if not redirect to manager-setup
  useEffect(() => {
    const checkManager = async () => {
      try {
        const response = await api.get('/auth/manager-exists');
        if (!response.data.data?.exists) {
          router.push('/manager-setup');
        }
      } catch (err) {
        console.error('Error checking manager:', err);
      } finally {
        setCheckingManager(false);
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
    setSuccess('');

    // Validation
    const { name, email, password, confirmPassword, flat_no, phone, category } = formData;

    if (!name || !email || !password || !confirmPassword || !phone || !category) {
      setError('Please fill in all required fields');
      return;
    }

    if (category !== 'watchman' && !flat_no) {
      setError('Please select a flat number');
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
      const payload = {
        name,
        email,
        password,
        phone,
        role: category === 'watchman' ? 'watchman' : 'resident',
        resident_type: category === 'watchman' ? null : (category === 'tenant' ? 'tenant' : 'owner'),
        flat_no: category === 'watchman' ? undefined : flat_no,
      };

      const response = await api.post('/auth/register', payload);

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth/manager status
  if (authLoading || checkingManager) {
    return (
      <Card className="border border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-700 animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Initializing registration portal...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-slate-900 tracking-tight">Create Community Account</CardTitle>
        <CardDescription className="text-center text-slate-500 text-xs">
          Join {SOCIETY_NAME} as a Flat Owner, Tenant, or Security Staff
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3.5 pt-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50/80 text-red-700 py-2.5">
              <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 inline" />
              <AlertDescription className="text-xs font-medium inline">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-slate-700 font-semibold text-xs">Your Role in Society *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
              disabled={loading}
            >
              <SelectTrigger id="category" className="h-10 bg-slate-50/50 border-slate-200 text-sm">
                <SelectValue placeholder="Select role/category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">🏠 Flat Owner (Resident Owner)</SelectItem>
                <SelectItem value="tenant">🔑 Tenant (Resident Tenant)</SelectItem>
                <SelectItem value="watchman">🛡️ Security / Watchman (Gate Staff)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-slate-700 font-semibold text-xs">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="name"
                type="text"
                placeholder="e.g. Rahul Patil"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
                className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-semibold text-xs">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
                className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.category !== 'watchman' && (
              <div className="space-y-1.5">
                <Label htmlFor="flat_no" className="text-slate-700 font-semibold text-xs">Flat Number *</Label>
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
            )}

            <div className={`space-y-1.5 ${formData.category === 'watchman' ? 'sm:col-span-2' : ''}`}>
              <Label htmlFor="phone" className="text-slate-700 font-semibold text-xs">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={loading}
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-xs">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={loading}
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
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
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3.5 pt-2 pb-6">
          <Button
            type="submit"
            className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-700/20 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Complete Registration
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-teal-700 font-bold hover:text-teal-800 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
