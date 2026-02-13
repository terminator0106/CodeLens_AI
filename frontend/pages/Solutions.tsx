import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Users, BookOpen, Search, GitMerge, CheckCircle2, Zap, FileText, Brain } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store';

export const Solutions: React.FC = () => {
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
                            <Link to="/solutions" className="text-sm font-medium text-primary border-b-2 border-primary">Solutions</Link>
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
                        Solutions for Every <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Development Team</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                        Whether you're a solo developer exploring new codebases or an enterprise team managing complex systems, CodeLens adapts to your workflow.
                    </p>
                </div>
            </section>

            {/* Solutions Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* For Developers */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-500 p-3 rounded-xl">
                                    <Code className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Developers</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Skip the endless file browsing when joining new projects or exploring unfamiliar codebases. Get instant context and understanding through AI-powered explanations.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Rapid Onboarding</h4>
                                        <p className="text-sm text-gray-600">Ask "Where is the authentication logic?" and get direct file references in seconds.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Code Exploration</h4>
                                        <p className="text-sm text-gray-600">Understand complex functions and classes with plain-English explanations.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Dependency Mapping</h4>
                                        <p className="text-sm text-gray-600">Visualize how modules connect and understand the impact of changes.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <p className="text-sm text-blue-800 italic">
                                    "I can now understand a new codebase in hours instead of weeks. CodeLens is like having a senior developer explain everything to me."
                                </p>
                                <p className="text-xs text-blue-600 mt-2 font-medium">— Frontend Developer at Tech Startup</p>
                            </div>
                        </div>

                        {/* For Teams */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="bg-purple-500 p-3 rounded-xl">
                                    <Users className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Teams</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Scale knowledge sharing across your engineering organization. Reduce context switching and accelerate feature development with shared understanding.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Knowledge Democratization</h4>
                                        <p className="text-sm text-gray-600">Every team member can understand any part of the codebase without bothering domain experts.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Faster Code Reviews</h4>
                                        <p className="text-sm text-gray-600">Reviewers can quickly understand context and side effects of proposed changes.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Reduced Bus Factor</h4>
                                        <p className="text-sm text-gray-600">Distribute tribal knowledge beyond individual team members throughout the codebase.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                <p className="text-sm text-purple-800 italic">
                                    "Our code review cycle time dropped by 40% because reviewers can instantly get context without lengthy explanations."
                                </p>
                                <p className="text-xs text-purple-600 mt-2 font-medium">— Engineering Manager at SaaS Company</p>
                            </div>
                        </div>

                        {/* For Code Reviews */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="bg-green-500 p-3 rounded-xl">
                                    <GitMerge className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Code Reviews</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Transform your review process with AI-powered context. Understand the full impact of changes and catch issues before they reach production.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Impact Analysis</h4>
                                        <p className="text-sm text-gray-600">See which other parts of the codebase might be affected by proposed changes.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Contextual Understanding</h4>
                                        <p className="text-sm text-gray-600">Quickly understand the purpose and architecture of modified code sections.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Quality Assurance</h4>
                                        <p className="text-sm text-gray-600">Spot potential bugs and anti-patterns through AI-assisted code analysis.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-green-800 italic">
                                    "I caught a subtle race condition that would have caused production issues. CodeLens showed me all the places this function was called."
                                </p>
                                <p className="text-xs text-green-600 mt-2 font-medium">— Senior Developer at Fintech Company</p>
                            </div>
                        </div>

                        {/* For Learning Large Codebases */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="bg-indigo-500 p-3 rounded-xl">
                                    <BookOpen className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Learning Large Codebases</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Navigate massive enterprise codebases with confidence. Turn intimidating legacy systems into approachable, well-documented architectures.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Guided Exploration</h4>
                                        <p className="text-sm text-gray-600">Ask high-level questions and get guided tour through relevant code sections.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Pattern Recognition</h4>
                                        <p className="text-sm text-gray-600">Identify common patterns, conventions, and architectural decisions across the codebase.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Legacy Navigation</h4>
                                        <p className="text-sm text-gray-600">Make sense of undocumented legacy code through AI-powered explanations.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                <p className="text-sm text-indigo-800 italic">
                                    "I was tasked with modernizing a 500k line legacy system. CodeLens helped me understand the business logic without spending months reading code."
                                </p>
                                <p className="text-xs text-indigo-600 mt-2 font-medium">— Staff Engineer at Enterprise Company</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            See how teams are using CodeLens to solve real development challenges
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Search className="text-blue-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Incident Response</h3>
                            <p className="text-gray-600 text-sm">
                                Quickly identify the root cause of production issues by asking "What changed in the payment service?"
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-100 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Brain className="text-purple-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Technical Debt</h3>
                            <p className="text-gray-600 text-sm">
                                Identify refactoring opportunities and understand the impact of modernizing legacy components.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <FileText className="text-green-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Documentation</h3>
                            <p className="text-gray-600 text-sm">
                                Generate up-to-date documentation that reflects your actual codebase, not stale wiki pages.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Revolutionize Your Development Process?
                    </h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        Join thousands of developers who have transformed how they understand and work with code.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-50">
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/pricing">
                            <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
                                View Pricing
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