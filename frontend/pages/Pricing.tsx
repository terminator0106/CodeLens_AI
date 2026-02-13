import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Check, Zap, Shield, Users, GitBranch, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store';

export const Pricing: React.FC = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navbar */}
            <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <Link to="/" className="flex items-center space-x-3">
                                <div className="bg-primary p-2 rounded-lg">
                                    <Code className="text-white" size={24} />
                                </div>
                                <span className="font-display font-bold text-xl tracking-tight text-gray-900">CodeLens AI</span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-10">
                            <Link to="/products" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Products</Link>
                            <Link to="/solutions" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Solutions</Link>
                            <Link to="/pricing" className="text-sm font-medium text-primary border-b-2 border-primary">Pricing</Link>
                            <Link to="/docs" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Docs</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <Link to="/dashboard">
                                    <Button size="md">Go to Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Sign in</Link>
                                    <Link to="/signup">
                                        <Button size="md">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                        Choose Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Perfect Plan</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                        Start free and scale as your team grows. No hidden fees, transparent pricing, and the flexibility to change plans anytime.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                                <p className="text-gray-600 mb-6">Perfect for individual developers and small projects</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">$0</span>
                                    <span className="text-gray-600 ml-2">forever</span>
                                </div>
                                <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                                    <Button variant="outline" className="w-full">
                                        {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Up to 3 repositories</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">500MB total storage</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Basic RAG chat (50 messages/month)</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Standard analytics dashboard</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Community support</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Public GitHub repositories only</span>
                                </div>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-white rounded-2xl shadow-xl border border-primary p-8 relative scale-105">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                                <p className="text-gray-600 mb-6">For growing teams and serious developers</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">$29</span>
                                    <span className="text-gray-600 ml-2">per user/month</span>
                                </div>
                                <Button className="w-full">
                                    Coming Soon
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Unlimited repositories</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">10GB storage per user</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Unlimited RAG chat messages</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Advanced analytics & insights</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Private repository support</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Priority email support</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Custom integrations (GitHub, GitLab)</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Export capabilities (CSV, JSON)</span>
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                                <p className="text-gray-600 mb-6">For large organizations with custom needs</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                                </div>
                                <Button variant="outline" className="w-full">
                                    Contact Sales
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Everything in Pro</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Self-hosted deployment</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Unlimited storage</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">SSO & SAML authentication</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Advanced security controls</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">24/7 dedicated support</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Custom AI model fine-tuning</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">SLA guarantees</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Feature Comparison</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            See exactly what's included in each plan
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-xl shadow-sm border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Free</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Pro</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                                        <GitBranch size={16} className="mr-2 text-blue-500" />
                                        Repository Ingestion
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-600">Up to 3</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-green-500 mx-auto" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-green-500 mx-auto" />
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                                        <MessageSquare size={16} className="mr-2 text-purple-500" />
                                        RAG Chat
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-600">50/month</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-600">Unlimited</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-600">Unlimited</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                                        <Zap size={16} className="mr-2 text-amber-500" />
                                        Analytics Dashboard
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-600">Basic</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-600">Advanced</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-600">Advanced</span>
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                                        <Shield size={16} className="mr-2 text-green-500" />
                                        Private Repositories
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-400">×</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-green-500 mx-auto" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-green-500 mx-auto" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                                        <Users size={16} className="mr-2 text-indigo-500" />
                                        Self-Hosted
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-400">×</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-400">×</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-green-500 mx-auto" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">How does the free plan work?</h3>
                            <p className="text-gray-600">
                                The free plan is completely free forever with no time limits. You can index up to 3 public repositories
                                and get 50 AI chat messages per month. Perfect for individual developers and small projects.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Can I change plans at any time?</h3>
                            <p className="text-gray-600">
                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                                and we'll prorate any billing differences.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">What's included in Enterprise?</h3>
                            <p className="text-gray-600">
                                Enterprise plans include self-hosted deployment, unlimited storage, SSO authentication,
                                24/7 support, custom AI model training, and dedicated account management.
                                <Link to="#" className="text-primary hover:underline ml-1">Contact us</Link> for custom pricing.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Do you offer annual discounts?</h3>
                            <p className="text-gray-600">
                                Yes! Annual plans receive 20% off the monthly price. We'll also offer volume discounts
                                for teams with 10+ users.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Start Your Free Trial Today
                    </h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        No credit card required. Upgrade when you're ready to scale.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-50">
                                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/products">
                            <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <div className="mb-8 md:mb-0">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="bg-primary p-1.5 rounded-lg">
                                    <Code className="text-white" size={20} />
                                </div>
                                <span className="font-bold text-white text-lg">CodeLens AI</span>
                            </div>
                            <p className="text-gray-400 text-sm max-w-xs">Intelligent documentation for modern engineering teams.</p>
                        </div>
                        <div className="flex space-x-12">
                            <div>
                                <h4 className="font-bold text-white mb-4">Product</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><Link to="/products" className="hover:text-white transition-colors">Features</Link></li>
                                    <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                    <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-4">Company</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><Link to="/solutions" className="hover:text-white transition-colors">Solutions</Link></li>
                                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                        <div className="text-sm text-gray-400">&copy; 2024 CodeLens Inc. All rights reserved.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};