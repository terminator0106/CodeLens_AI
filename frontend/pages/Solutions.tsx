import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Users, BookOpen, Search, GitMerge, CheckCircle2, Zap, FileText, Brain } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GridOverlay } from '../components/ui/grid-feature-cards';
import { TextType } from '../components/ui/TextType';
import { useAuthStore, useUIStore } from '../store';
import { Footer } from '../components/layout/Footer';

export const Solutions: React.FC = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const openAuthModal = useUIStore((state) => state.openAuthModal);

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
                            <Link to="/solutions" className="text-sm font-medium text-primary border-b-2 border-primary">Solutions</Link>
                            <Link to="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <Link to="/dashboard">
                                    <Button size="md">Go to Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="text-sm font-semibold text-muted-foreground hover:text-foreground"
                                        onClick={() => openAuthModal('login')}
                                    >
                                        Sign in
                                    </button>
                                    <Button size="md" onClick={() => openAuthModal('signup')}>
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 drop-shadow-lg">
                        <TextType
                            as="span"
                            text={"Solutions for Every\nDevelopment Team"}
                            typingSpeed={55}
                            deletingSpeed={35}
                            pauseDuration={1800}
                            loop
                            showCursor={false}
                        />
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                        Whether you're a solo developer exploring new codebases or an enterprise team managing complex systems, CodeLens adapts to your workflow.
                    </p>
                </div>
            </section>

            {/* Solutions Grid */}
            <section className="py-20 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* For Developers */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl shadow-float border border-border p-8 ai-card group hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-6 relative z-10">
                                <div className="bg-primary/30 p-3 rounded-xl group-hover:bg-primary/50 transition-colors">
                                    <Code className="text-primary" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground ml-4">For Developers</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                Skip the endless file browsing when joining new projects or exploring unfamiliar codebases. Get instant context and understanding through AI-powered explanations.
                            </p>
                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Rapid Onboarding</h4>
                                        <p className="text-sm text-muted-foreground">Ask "Where is the authentication logic?" and get direct file references in seconds.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Code Exploration</h4>
                                        <p className="text-sm text-muted-foreground">Understand complex functions and classes with plain-English explanations.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Dependency Mapping</h4>
                                        <p className="text-sm text-muted-foreground">Visualize how modules connect and understand the impact of changes.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                                <p className="text-sm text-foreground italic">
                                    "I can now understand a new codebase in hours instead of weeks. CodeLens is like having a senior developer explain everything to me."
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 font-medium">— Frontend Developer at Tech Startup</p>
                            </div>
                        </div>

                        {/* For Teams */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl shadow-float border border-border p-8 ai-card group hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-6 relative z-10">
                                <div className="bg-primary/30 p-3 rounded-xl group-hover:bg-primary/50 transition-colors">
                                    <Users className="text-primary" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground ml-4">For Teams</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                Scale knowledge sharing across your engineering organization. Reduce context switching and accelerate feature development with shared understanding.
                            </p>
                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Knowledge Democratization</h4>
                                        <p className="text-sm text-muted-foreground">Every team member can understand any part of the codebase without bothering domain experts.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Faster Code Reviews</h4>
                                        <p className="text-sm text-muted-foreground">Reviewers can quickly understand context and side effects of proposed changes.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Reduced Bus Factor</h4>
                                        <p className="text-sm text-muted-foreground">Distribute tribal knowledge beyond individual team members throughout the codebase.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                                <p className="text-sm text-foreground italic">
                                    "Our code review cycle time dropped by 40% because reviewers can instantly get context without lengthy explanations."
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 font-medium">— Engineering Manager at SaaS Company</p>
                            </div>
                        </div>

                        {/* For Code Reviews */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl shadow-float border border-border p-8 ai-card group hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-6 relative z-10">
                                <div className="bg-primary/30 p-3 rounded-xl group-hover:bg-primary/50 transition-colors">
                                    <GitMerge className="text-primary" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground ml-4">For Code Reviews</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                Transform your review process with AI-powered context. Understand the full impact of changes and catch issues before they reach production.
                            </p>
                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Impact Analysis</h4>
                                        <p className="text-sm text-muted-foreground">See which other parts of the codebase might be affected by proposed changes.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Contextual Understanding</h4>
                                        <p className="text-sm text-muted-foreground">Quickly understand the purpose and architecture of modified code sections.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Quality Assurance</h4>
                                        <p className="text-sm text-muted-foreground">Spot potential bugs and anti-patterns through AI-assisted code analysis.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                                <p className="text-sm text-foreground italic">
                                    "I caught a subtle race condition that would have caused production issues. CodeLens showed me all the places this function was called."
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 font-medium">— Senior Developer at Fintech Company</p>
                            </div>
                        </div>

                        {/* For Learning Large Codebases */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl shadow-float border border-border p-8 ai-card group hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-6 relative z-10">
                                <div className="bg-primary/30 p-3 rounded-xl group-hover:bg-primary/50 transition-colors">
                                    <BookOpen className="text-primary" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground ml-4">For Learning Large Codebases</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                Navigate massive enterprise codebases with confidence. Turn intimidating legacy systems into approachable, well-documented architectures.
                            </p>
                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Guided Exploration</h4>
                                        <p className="text-sm text-muted-foreground">Ask high-level questions and get guided tour through relevant code sections.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Pattern Recognition</h4>
                                        <p className="text-sm text-muted-foreground">Identify common patterns, conventions, and architectural decisions across the codebase.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Legacy Navigation</h4>
                                        <p className="text-sm text-muted-foreground">Make sense of undocumented legacy code through AI-powered explanations.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                                <p className="text-sm text-foreground italic">
                                    "I was tasked with modernizing a 500k line legacy system. CodeLens helped me understand the business logic without spending months reading code."
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 font-medium">— Staff Engineer at Enterprise Company</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Common Use Cases</h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            See how teams are using CodeLens to solve real development challenges
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="relative overflow-hidden text-center p-6 rounded-2xl border border-border bg-black/40 backdrop-blur-sm hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="bg-primary/20 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center relative z-10">
                                <Search className="text-foreground" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">Incident Response</h3>
                            <p className="text-muted-foreground text-sm relative z-10">
                                Quickly identify the root cause of production issues by asking "What changed in the payment service?"
                            </p>
                        </div>
                        <div className="relative overflow-hidden text-center p-6 rounded-2xl border border-border bg-black/40 backdrop-blur-sm hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="bg-primary/20 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center relative z-10">
                                <Brain className="text-foreground" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">Technical Debt</h3>
                            <p className="text-muted-foreground text-sm relative z-10">
                                Identify refactoring opportunities and understand the impact of modernizing legacy components.
                            </p>
                        </div>
                        <div className="relative overflow-hidden text-center p-6 rounded-2xl border border-border bg-black/40 backdrop-blur-sm hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="bg-primary/20 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center relative z-10">
                                <FileText className="text-foreground" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">Documentation</h3>
                            <p className="text-muted-foreground text-sm relative z-10">
                                Generate up-to-date documentation that reflects your actual codebase, not stale wiki pages.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-secondary/30 border-t border-border">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Ready to see CodeLens on your team?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Start with our free plan and invite your teammates in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        {isAuthenticated ? (
                            <Link to="/dashboard">
                                <Button size="lg">
                                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="lg"
                                onClick={() => openAuthModal('signup')}
                            >
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-secondary/30 border-t border-border">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Ready to Revolutionize Your Development Process?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Join thousands of developers who have transformed how they understand and work with code.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                            <Button size="lg">
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/products">
                            <Button size="lg" variant="secondary">
                                Explore Features
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