import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, GitBranch, BarChart3, Shield, Zap, FileSearch, MessageSquare, Brain, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store';

export const Products: React.FC = () => {
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
                            <Link to="/products" className="text-sm font-medium text-primary border-b-2 border-primary">Products</Link>
                            <Link to="/solutions" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Solutions</Link>
                            <Link to="/pricing" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Pricing</Link>
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
            <section className="pt-20 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                        Products That Transform <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">How You Code</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                        Four core products that work together to give you unprecedented visibility into your codebase and accelerate development workflows.
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Repo Ingestion */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-500 p-3 rounded-xl">
                                    <GitBranch className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 ml-4">Repository Ingestion</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Connect any GitHub, GitLab, or Bitbucket repository and automatically parse, analyze, and index your entire codebase. Supports repositories up to 10GB with intelligent chunking for optimal RAG performance.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Multi-language support (Python, JavaScript, Go, Rust, etc.)
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Automatic dependency mapping and imports analysis
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Incremental updates on repository changes
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Vector embeddings for semantic search
                                </li>
                            </ul>
                        </div>

                        {/* Code-aware Chat */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="bg-purple-500 p-3 rounded-xl">
                                    <MessageSquare className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 ml-4">Code-aware Chat (RAG)</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Chat with your codebase using advanced RAG (Retrieval-Augmented Generation). Get precise answers grounded in your actual code with file references and line numbers.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Natural language queries about code functionality
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Contextual responses with source file citations
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Chat history persistence across sessions
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Smart recommendations for code improvements
                                </li>
                            </ul>
                        </div>

                        {/* Analytics */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="bg-green-500 p-3 rounded-xl">
                                    <BarChart3 className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 ml-4">Analytics & Observability</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Get deep insights into your codebase structure, complexity metrics, and ingestion performance. Track how your code evolves over time with comprehensive analytics.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    File and chunk distribution analysis
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Language composition breakdown
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Ingestion performance metrics
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Export capabilities for further analysis
                                </li>
                            </ul>
                        </div>

                        {/* Secure Auth */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="bg-indigo-500 p-3 rounded-xl">
                                    <Shield className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 ml-4">Secure Authentication</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Enterprise-grade security with user management, session handling, and secure API access. Your code never leaves your infrastructure in our self-hosted options.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    JWT-based authentication
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    User profile and preference management
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Repository access controls
                                </li>
                                <li className="flex items-center text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                    Audit logging and activity tracking
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Development Workflow?
                    </h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        Start with our free plan and experience the power of AI-driven code intelligence.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-50">
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/demo">
                            <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
                                Watch Demo
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