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
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px] text-center">
        <div className="mx-auto bg-primary h-14 w-14 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
          <Code className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Create your account</h2>
        <p className="mt-3 text-base text-gray-600">
          Join 10,000+ developers documenting with AI
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-10 px-6 shadow-soft rounded-2xl border border-gray-100 sm:px-12">
          <form
            className="space-y-6"
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
              <input id="terms" name="terms" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" required />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" className="font-medium text-primary hover:underline">Terms</a> and <a href="#" className="font-medium text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={loading}>
              Create Account
            </Button>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-indigo-700 transition-colors">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};