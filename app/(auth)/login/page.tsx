'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoginUser } from '@/types';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginUser>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ email: formData.email, name: 'Norita Miranda' }));
      router.push('/');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Demo onboarding hint */}
      <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-md text-xs mb-2">
        <strong>Demo Mode:</strong> Use any email and password to sign in. All data is simulated.
      </div>

      {/* ── Logo ── */}
      <div className="flex items-center justify-center">
        <Image
          src="/icons/logo.png"
          alt="Bankify"
          width={48}
          height={48}
          priority
        />
      </div>

      {/* ── Heading ── */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(0, 0, 0)' }}>
          Welcome back
        </h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Submit button — #fff498 ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#fff498',
            color: '#1a1a1a',
          }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* ── Footer ── */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
         <Link href="#" className="font-semibold transition-colors" style={{ color: '#1a1a1a' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}