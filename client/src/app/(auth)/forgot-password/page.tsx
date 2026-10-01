'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, KeyRound, Lock, ArrowLeft, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { SOCIETY_NAME } from '@/lib/constants';
import api from '@/lib/api';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>('email');

  // Form data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setMessage(response.data.message || 'OTP sent to your email');
        setStep('otp');
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      if (response.data.success && response.data.data?.resetToken) {
        setResetToken(response.data.data.resetToken);
        setMessage('OTP verified successfully');
        setStep('password');
      } else {
        setError(response.data.message || 'Invalid or expired OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email,
        resetToken,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setStep('success');
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setMessage('New OTP sent to your email');
        setOtp('');
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Progress indicator styled for Atharva Society theme
  const ProgressSteps = () => (
    <div className="flex items-center justify-center space-x-2 mb-5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        step === 'email' ? 'bg-teal-700 text-white' :
        step !== 'email' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
      }`}>
        {step !== 'email' ? '✓' : '1'}
      </div>
      <div className={`w-12 h-1 rounded ${step !== 'email' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        step === 'otp' ? 'bg-teal-700 text-white' :
        step === 'password' || step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
      }`}>
        {step === 'password' || step === 'success' ? '✓' : '2'}
      </div>
      <div className={`w-12 h-1 rounded ${step === 'password' || step === 'success' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        step === 'password' ? 'bg-teal-700 text-white' :
        step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
      }`}>
        {step === 'success' ? '✓' : '3'}
      </div>
    </div>
  );

  // Step 1: Email Input
  if (step === 'email') {
    return (
      <Card className="border border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 pb-4 border-b border-slate-100 bg-slate-50/70 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs max-w-xs mx-auto">
            Enter your email address to receive a 6-digit OTP to reset your password
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRequestOTP}>
          <CardContent className="space-y-4 pt-5">
            <ProgressSteps />

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700 py-2.5">
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
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3.5 pt-2 pb-6">
            <Button
              type="submit"
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-between w-full text-xs text-slate-600">
              <Link href="/" className="text-slate-500 hover:text-teal-700 inline-flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </Link>
              <Link href="/login" className="text-teal-700 font-bold hover:text-teal-800 hover:underline">
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    );
  }

  // Step 2: OTP Verification
  if (step === 'otp') {
    return (
      <Card className="border border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 pb-4 border-b border-slate-100 bg-slate-50/70 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Verify OTP Code
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs max-w-xs mx-auto">
            Enter the 6-digit verification code sent to<br />
            <span className="font-bold text-slate-800">{email}</span>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerifyOTP}>
          <CardContent className="space-y-4 pt-5">
            <ProgressSteps />

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700 py-2.5">
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 py-2.5">
                <AlertDescription className="text-xs font-medium">{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center text-xs text-slate-500">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-teal-700 font-bold hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3.5 pt-2 pb-6">
            <Button
              type="submit"
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition-all"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Proceed
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError(''); setMessage(''); }}
              className="text-xs text-slate-500 hover:text-teal-700 inline-flex items-center gap-1 font-medium mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change Email Address
            </button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  // Step 3: New Password
  if (step === 'password') {
    return (
      <Card className="border border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 pb-4 border-b border-slate-100 bg-slate-50/70 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Set New Password
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs max-w-xs mx-auto">
            Create a secure password for your {SOCIETY_NAME} account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4 pt-5">
            <ProgressSteps />

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700 py-2.5">
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-slate-700 font-semibold text-xs">New Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-xs">Confirm New Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  className="pl-10 h-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-teal-600 text-sm"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3.5 pt-2 pb-6">
            <Button
              type="submit"
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  Reset Password & Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  // Step 4: Success
  return (
    <Card className="border border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
      <CardHeader className="space-y-2 pb-4 border-b border-slate-100 bg-emerald-50/50 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Password Changed!
        </CardTitle>
        <CardDescription className="text-slate-600 text-xs max-w-xs mx-auto">
          Your password has been successfully updated. You can now log in with your new credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6 space-y-4">
        <Button
          onClick={() => router.push('/login')}
          className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm"
        >
          Proceed to Login <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
