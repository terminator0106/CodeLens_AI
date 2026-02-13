import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store';
import { Mail, Lock, User, Code, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export const Signup: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-purple-50/50"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-radial from-emerald-200/40 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-200/30 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000"></div>

      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 bg-white/60 backdrop-blur-md px-4 py-2 rounded-lg shadow-float hover:shadow-glow">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px] text-center z-10">
        <div className="mx-auto bg-gradient-to-br from-emerald-500 to-blue-600 h-16 w-16 rounded-2xl flex items-center justify-center mb-8 shadow-float animate-fade-in">
          <Code className="text-white" size={36} />
        </div>
        <h2 className="text-4xl font-display font-bold text-gray-900 tracking-tight animate-fade-in animation-delay-200">Create your account</h2>
        <p className="mt-4 text-lg text-gray-600 animate-fade-in animation-delay-300">
          Join 10,000+ developers documenting with AI
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-[480px] z-10">
        <div className="bg-white/90 backdrop-blur-md py-12 px-8 shadow-float hover:shadow-glow rounded-2xl border border-white/20 sm:px-12 transition-all duration-500 animate-fade-in animation-delay-400">
          <form
            className="space-y-8"
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
              }
              setLoading(true);
              try {
                const response = await api.signup(email, password);
                login(response.user);
                navigate('/dashboard');
              } catch (err) {
                setError((err as Error).message || 'Unable to sign up');
              } finally {
                setLoading(false);
              }
            }}
          >
            <Input
              label="Full Name"
              type="text"
              required
              icon={<User size={18} />}
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email address"
              type="email"
              required
              icon={<Mail size={18} />}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              icon={<Lock size={18} />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              icon={<Lock size={18} />}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex items-center pt-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded shadow-sm transition-all"
                required
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                I agree to the <a href="#" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">Terms</a> and <a href="#" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">Privacy Policy</a>
              </label>
            </div>

            <Button type="submit" className="w-full hover:scale-105 transition-transform duration-200" size="lg" isLoading={loading}>
              Create Account
            </Button>
            {error && (
              <div className="p-4 bg-red-50/80 backdrop-blur-md border border-red-200/50 rounded-lg">
                <p className="text-sm text-red-700 text-center font-medium">{error}</p>
              </div>
            )}
          </form>

          <p className="mt-10 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};