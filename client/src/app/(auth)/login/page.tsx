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
import { Mail, Lock, ArrowRight, Loader2, LogIn, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Redirect based on user role
        if (result.user?.role === 'watchman') {
          router.push('/watchman');
        } else {
          router.push('/');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <Card className="border border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-700 animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Checking authentication...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 pb-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <LogIn className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-slate-900 tracking-tight">Resident & Staff Login</CardTitle>
        <CardDescription className="text-center text-slate-500 text-xs">
          Sign in to access your Atharva Society portal
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-5">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50/80 text-red-700 py-2.5">
              <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-semibold text-xs">Registered Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="e.g. name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-xs">Password</Label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-teal-700 hover:text-teal-800 font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
          <Button 
            type="submit" 
            className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-700/20 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-500">New resident or staff?</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-slate-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/register" 
              className="text-teal-700 font-bold hover:text-teal-800 hover:underline"
            >
              Register here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
