import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Check, Zap, Shield, Users, GitBranch, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextType } from '../components/ui/TextType';
import { Footer } from '../components/layout/Footer';
import { useAuthStore } from '../store';

export const Pricing: React.FC = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {/* Navbar */}
            <nav className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <Link to="/" className="flex items-center space-x-3">
                                <div className="bg-primary p-2 rounded-lg">
                                    <Code className="text-white" size={24} />
                                </div>
                                <span className="font-display font-bold text-xl tracking-tight text-foreground">CodeLens AI</span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-10">
                            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
                            <Link to="/solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
                            <Link to="/pricing" className="text-sm font-medium text-primary border-b-2 border-primary">Pricing</Link>
                            <Link to="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <Link to="/dashboard">
                                    <Button size="md">Go to Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Sign in</Link>
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
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 drop-shadow-lg">
                        <TextType
                            as="span"
                            text={"Choose Your\nPerfect Plan"}
                            typingSpeed={55}
                            deletingSpeed={35}
                            pauseDuration={1800}
                            loop
                            showCursor={false}
                        />
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                        Start free and scale as your team grows. No hidden fees, transparent pricing, and the flexibility to change plans anytime.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-card rounded-2xl shadow-float border border-border p-8 relative ai-card">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                                <p className="text-muted-foreground mb-6">Perfect for individual developers and small projects</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-foreground">$0</span>
                                    <span className="text-muted-foreground ml-2">forever</span>
                                </div>
                                <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                                    <Button variant="outline" className="w-full">
                                        {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Up to 3 repositories</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">500MB total storage</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Basic RAG chat (50 messages/month)</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Standard analytics dashboard</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Community support</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Public GitHub repositories only</span>
                                </div>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-card rounded-2xl shadow-xl border border-primary p-8 relative scale-105 ai-card">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-primary text-background px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                                <p className="text-muted-foreground mb-6">For growing teams and serious developers</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-foreground">$29</span>
                                    <span className="text-muted-foreground ml-2">per user/month</span>
                                </div>
                                <Button className="w-full">
                                    Coming Soon
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Unlimited repositories</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">10GB storage per user</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Unlimited RAG chat messages</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Advanced analytics & insights</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Private repository support</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Priority email support</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Custom integrations (GitHub, GitLab)</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Export capabilities (CSV, JSON)</span>
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-card rounded-2xl shadow-float border border-border p-8 relative ai-card">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
                                <p className="text-muted-foreground mb-6">For large organizations with custom needs</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-foreground">Custom</span>
                                </div>
                                <Button variant="outline" className="w-full">
                                    Contact Sales
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Everything in Pro</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Self-hosted deployment</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Unlimited storage</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">SSO & SAML authentication</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Advanced security controls</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">24/7 dedicated support</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">Custom AI model fine-tuning</span>
                                </div>
                                <div className="flex items-center">
                                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                                    <span className="text-sm text-foreground">SLA guarantees</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Feature Comparison</h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            See exactly what's included in each plan
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-card rounded-xl shadow-float border border-border">
                            <thead className="bg-secondary/40">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Features</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Free</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Pro</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <tr>
                                    <td className="px-6 py-4 text-sm text-foreground flex items-center">
                                        <GitBranch size={16} className="mr-2 text-primary" />
                                        Repository Ingestion
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground">Up to 3</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-accent mx-auto" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-accent mx-auto" />
                                    </td>
                                </tr>
                                <tr className="bg-secondary/20">
                                    <td className="px-6 py-4 text-sm text-foreground flex items-center">
                                        <MessageSquare size={16} className="mr-2 text-primary" />
                                        RAG Chat
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground">50/month</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground">Unlimited</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground">Unlimited</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-foreground flex items-center">
                                        <Zap size={16} className="mr-2 text-primary" />
                                        Analytics Dashboard
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground">Basic</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground">Advanced</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground">Advanced</span>
                                    </td>
                                </tr>
                                <tr className="bg-secondary/20">
                                    <td className="px-6 py-4 text-sm text-foreground flex items-center">
                                        <Shield size={16} className="mr-2 text-primary" />
                                        Private Repositories
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground/50">×</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-accent mx-auto" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-accent mx-auto" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-foreground flex items-center">
                                        <Users size={16} className="mr-2 text-primary" />
                                        Self-Hosted
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground/50">×</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-muted-foreground/50">×</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Check size={16} className="text-accent mx-auto" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-secondary/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-card rounded-xl shadow-float border border-border p-6 ai-card">
                            <h3 className="text-lg font-bold text-foreground mb-2">How does the free plan work?</h3>
                            <p className="text-muted-foreground">
                                The free plan is completely free forever with no time limits. You can index up to 3 public repositories
                                and get 50 AI chat messages per month. Perfect for individual developers and small projects.
                            </p>
                        </div>
                        <div className="bg-card rounded-xl shadow-float border border-border p-6 ai-card">
                            <h3 className="text-lg font-bold text-foreground mb-2">Can I change plans at any time?</h3>
                            <p className="text-muted-foreground">
                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                                and we'll prorate any billing differences.
                            </p>
                        </div>
                        <div className="bg-card rounded-xl shadow-float border border-border p-6 ai-card">
                            <h3 className="text-lg font-bold text-foreground mb-2">What's included in Enterprise?</h3>
                            <p className="text-muted-foreground">
                                Enterprise plans include self-hosted deployment, unlimited storage, SSO authentication,
                                24/7 support, custom AI model training, and dedicated account management.
                                <Link to="#" className="text-primary hover:underline ml-1">Contact us</Link> for custom pricing.
                            </p>
                        </div>
                        <div className="bg-card rounded-xl shadow-float border border-border p-6 ai-card">
                            <h3 className="text-lg font-bold text-foreground mb-2">Do you offer annual discounts?</h3>
                            <p className="text-muted-foreground">
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
                    <h2 className="text-3xl md:text-4xl font-bold text-background mb-6">
                        Start Your Free Trial Today
                    </h2>
                    <p className="text-xl text-primary/80 mb-8">
                        No credit card required. Upgrade when you're ready to scale.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                            <Button size="lg" variant="secondary" className="bg-background text-primary hover:bg-background/80">
                                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/products">
                            <Button size="lg" variant="ghost" className="text-background border-background hover:bg-background/10">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <Footer />
        </div>
    );
};