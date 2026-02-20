import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useAuthStore, useUIStore } from '../../store';
import { api } from '../../services/api';

export const AuthModal: React.FC = () => {
    const authModalMode = useUIStore((state) => state.authModalMode);
    const closeAuthModal = useUIStore((state) => state.closeAuthModal);
    const loginStore = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isOpen = authModalMode !== null;
    const isSignup = authModalMode === 'signup';

    const handleClose = () => {
        if (loading) return;
        setError('');
        setEmail('');
        setPassword('');
        setFullName('');
        setConfirmPassword('');
        setRememberMe(false);
        closeAuthModal();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isSignup && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            if (isSignup) {
                const response = await api.signup(fullName, email, password);
                loginStore(response.user);
            } else {
                const response = await api.login(email, password, rememberMe);
                loginStore(response.user);
            }
            handleClose();
            navigate('/dashboard');
        } catch (err) {
            setError((err as Error).message || (isSignup ? 'Unable to sign up' : 'Unable to sign in'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isSignup ? 'Create your account' : 'Welcome back'}
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                {isSignup && (
                    <Input
                        label="Username"
                        type="text"
                        required
                        icon={<User size={18} />}
                        placeholder="janedoe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                )}
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
                {!isSignup && (
                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center space-x-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-border rounded shadow-sm transition-all"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
                    </div>
                )}
                {isSignup && (
                    <Input
                        label="Confirm Password"
                        type="password"
                        required
                        icon={<Lock size={18} />}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                )}

                {error && (
                    <div className="p-3 bg-destructive/15 border border-destructive/40 rounded-lg">
                        <p className="text-xs text-destructive text-center font-medium">{error}</p>
                    </div>
                )}

                <Button type="submit" className="w-full hover:scale-105 transition-transform duration-200" size="lg" isLoading={loading}>
                    {isSignup ? 'Create Account' : 'Sign in'}
                </Button>

                {!isSignup ? (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            className="font-semibold text-primary hover:text-accent transition-colors"
                            onClick={() => useUIStore.getState().openAuthModal('signup')}
                        >
                            Sign up for free
                        </button>
                    </p>
                ) : (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Already have an account?{' '}
                        <button
                            type="button"
                            className="font-semibold text-primary hover:text-accent transition-colors"
                            onClick={() => useUIStore.getState().openAuthModal('login')}
                        >
                            Log in instead
                        </button>
                    </p>
                )}
            </form>
        </Modal>
    );
};
