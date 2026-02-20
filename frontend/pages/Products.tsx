import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, GitBranch, BarChart3, Shield, Zap, FileSearch, MessageSquare, Brain, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GridOverlay } from '../components/ui/grid-feature-cards';
import { TextType } from '../components/ui/TextType';
import { useAuthStore, useUIStore } from '../store';
import { Footer } from '../components/layout/Footer';

export const Products: React.FC = () => {
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
                            <Link to="/products" className="text-sm font-medium text-primary border-b-2 border-primary">Products</Link>
                            <Link to="/solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
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
                            text={"Products That Transform\nHow You Code"}
                            typingSpeed={55}
                            deletingSpeed={35}
                            pauseDuration={1800}
                            loop
                            showCursor={false}
                        />
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                        Four core products that work together to give you unprecedented visibility into your codebase and accelerate development workflows.
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-20 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Repo Ingestion */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl shadow-float border border-border p-8 ai-card group hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-6 relative z-10">
                                <div className="bg-primary/30 p-3 rounded-xl group-hover:bg-primary/50 transition-colors">
                                    <GitBranch className="text-primary" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground ml-4">Repository Ingestion</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                Connect any GitHub, GitLab, or Bitbucket repository and automatically parse, analyze, and index your entire codebase. Supports repositories up to 10GB with intelligent chunking for optimal RAG performance.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Multi-language support (Python, JavaScript, Go, Rust, etc.)
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Automatic dependency mapping and imports analysis
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Incremental updates on repository changes
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Vector embeddings for semantic search
                                </li>
                            </ul>
                        </div>

                        {/* Code-aware Chat */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl shadow-float border border-border p-8 ai-card group hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-6 relative z-10">
                                <div className="bg-primary/30 p-3 rounded-xl group-hover:bg-primary/50 transition-colors">
                                    <MessageSquare className="text-primary" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground ml-4">Code-aware Chat (RAG)</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                Chat with your codebase using advanced RAG (Retrieval-Augmented Generation). Get precise answers grounded in your actual code with file references and line numbers.
                            </p>
                            <ul className="space-y-3 mb-8 relative z-10">
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Natural language queries about code functionality
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Contextual responses with source file citations
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Chat history persistence across sessions
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Smart recommendations for code improvements
                                </li>
                            </ul>
                        </div>

                        {/* Analytics */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl shadow-float border border-border p-8 ai-card group hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-6 relative z-10">
                                <div className="bg-primary/30 p-3 rounded-xl group-hover:bg-primary/50 transition-colors">
                                    <BarChart3 className="text-primary" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground ml-4">Analytics & Observability</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                Get deep insights into your codebase structure, complexity metrics, and ingestion performance. Track how your code evolves over time with comprehensive analytics.
                            </p>
                            <ul className="space-y-3 mb-8 relative z-10">
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    File and chunk distribution analysis
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Language composition breakdown
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Ingestion performance metrics
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Export capabilities for further analysis
                                </li>
                            </ul>
                        </div>

                        {/* Secure Auth */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl shadow-float border border-border p-8 ai-card group hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-6 relative z-10">
                                <div className="bg-primary/30 p-3 rounded-xl group-hover:bg-primary/50 transition-colors">
                                    <Shield className="text-primary" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground ml-4">Secure Authentication</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                                Enterprise-grade security with user management, session handling, and secure API access. Your code never leaves your infrastructure in our self-hosted options.
                            </p>
                            <ul className="space-y-3 mb-8 relative z-10">
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    JWT-based authentication
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    User profile and preference management
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Repository access controls
                                </li>
                                <li className="flex items-center text-sm text-foreground">
                                    <CheckCircle2 size={16} className="text-accent mr-3 flex-shrink-0" />
                                    Audit logging and activity tracking
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-secondary/30 border-t border-border">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Ready to Transform Your Development Workflow?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Start with our free plan and experience the power of AI-driven code intelligence.
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
                                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        )}
                        <Link to="/demo">
                            <Button size="lg" variant="secondary">
                                Watch Demo
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