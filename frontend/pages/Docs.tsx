import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, BookOpen, GitBranch, MessageSquare, BarChart3, Settings, Search, FileText, Zap, Shield, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store';

export const Docs: React.FC = () => {
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
                            <Link to="/pricing" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Pricing</Link>
                            <Link to="/docs" className="text-sm font-medium text-primary border-b-2 border-primary">Docs</Link>
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
                        Documentation & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Getting Started</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                        Learn how to get the most out of CodeLens AI with comprehensive guides, tutorials, and technical documentation.
                    </p>
                </div>
            </section>

            {/* Quick Start */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Guide</h2>
                        <p className="text-xl text-gray-600">Get up and running in under 5 minutes</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="bg-blue-100 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">1. Sign Up</h3>
                            <p className="text-gray-600 text-sm">
                                Create your free account and verify your email address. No credit card required.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="bg-purple-100 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                                <GitBranch className="text-purple-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">2. Add Repository</h3>
                            <p className="text-gray-600 text-sm">
                                Connect your GitHub repository and let our AI parse and index your codebase.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="bg-green-100 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                                <MessageSquare className="text-green-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">3. Start Chatting</h3>
                            <p className="text-gray-600 text-sm">
                                Ask questions about your code and get instant, contextual answers with file references.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Concepts */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Core Concepts</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Understand the fundamentals of how CodeLens works
                        </p>
                    </div>

                    <div className="space-y-16">
                        {/* How Ingestion Works */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center mb-6">
                                    <GitBranch className="text-blue-500 mr-3" size={28} />
                                    <h3 className="text-2xl font-bold text-gray-900">How Repository Ingestion Works</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-600 leading-relaxed">
                                        When you connect a repository, CodeLens performs a deep analysis of your codebase:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-1">
                                                <span className="text-xs font-bold px-1">1</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Repository Cloning</h4>
                                                <p className="text-sm text-gray-600">We securely clone your repository and analyze the file structure.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-1">
                                                <span className="text-xs font-bold px-1">2</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Code Parsing</h4>
                                                <p className="text-sm text-gray-600">Extract syntax, dependencies, imports, and semantic structure.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-1">
                                                <span className="text-xs font-bold px-1">3</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Intelligent Chunking</h4>
                                                <p className="text-sm text-gray-600">Break code into logical, searchable chunks that preserve context.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-1">
                                                <span className="text-xs font-bold px-1">4</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Vector Embeddings</h4>
                                                <p className="text-sm text-gray-600">Generate embeddings for semantic search and AI-powered analysis.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Supported Languages</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">20+</span>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        Python, JavaScript, TypeScript, Go, Rust, Java, C++, PHP, Ruby, Swift, Kotlin, and more.
                                    </div>
                                    <div className="border-t border-blue-200 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Max Repository Size</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">10 GB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What is RAG */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                                    <h4 className="font-bold text-gray-900 mb-4">RAG Benefits</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <span className="text-gray-700">Grounded in your actual code</span>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <span className="text-gray-700">No hallucinated responses</span>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <span className="text-gray-700">Always up-to-date</span>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <span className="text-gray-700">File references included</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="flex items-center mb-6">
                                    <MessageSquare className="text-purple-500 mr-3" size={28} />
                                    <h3 className="text-2xl font-bold text-gray-900">What is RAG (Retrieval-Augmented Generation)?</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-600 leading-relaxed">
                                        RAG combines the power of large language models with your specific codebase knowledge.
                                        Instead of relying solely on pre-trained knowledge, our AI retrieves relevant code snippets
                                        from your repository and uses them to provide accurate, contextual answers.
                                    </p>
                                    <p className="text-gray-600 leading-relaxed">
                                        Unlike generic code assistants, CodeLens understands your specific architecture, naming
                                        conventions, and business logic because it's trained on your actual codebase.
                                    </p>
                                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                        <p className="text-sm text-purple-800 font-medium mb-1">Example Query:</p>
                                        <p className="text-sm text-purple-700 italic">"Where is the user authentication logic handled?"</p>
                                        <p className="text-xs text-purple-600 mt-2">
                                            → Returns specific files, functions, and line numbers from your codebase
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat is Grounded */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center mb-6">
                                    <Zap className="text-amber-500 mr-3" size={28} />
                                    <h3 className="text-2xl font-bold text-gray-900">How Chat is Grounded in Your Code</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-600 leading-relaxed">
                                        Every chat response is backed by actual code from your repository. Our system:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-amber-100 text-amber-600 rounded-full p-1 mt-1">
                                                <Search size={12} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Semantic Search</h4>
                                                <p className="text-sm text-gray-600">Finds relevant code chunks based on your question's intent.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-amber-100 text-amber-600 rounded-full p-1 mt-1">
                                                <FileText size={12} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Context Assembly</h4>
                                                <p className="text-sm text-gray-600">Combines relevant code snippets with your question for the AI.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-amber-100 text-amber-600 rounded-full p-1 mt-1">
                                                <MessageSquare size={12} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Response Generation</h4>
                                                <p className="text-sm text-gray-600">AI generates answer based on your actual code, not general knowledge.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-amber-100 text-amber-600 rounded-full p-1 mt-1">
                                                <BookOpen size={12} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Source Citation</h4>
                                                <p className="text-sm text-gray-600">Includes file paths and line numbers for verification.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-100">
                                <h4 className="font-bold text-gray-900 mb-4">Sample Chat Interaction</h4>
                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                                        <p className="text-sm text-gray-800 font-medium">You:</p>
                                        <p className="text-sm text-gray-600">"How does the password reset functionality work?"</p>
                                    </div>
                                    <div className="bg-amber-100 rounded-lg p-3 border border-amber-200">
                                        <p className="text-sm text-amber-800 font-medium">CodeLens:</p>
                                        <p className="text-sm text-amber-700">
                                            "The password reset flow is handled in multiple steps starting with the
                                            <code className="bg-amber-200 px-1 rounded">PasswordResetController</code>..."
                                        </p>
                                        <p className="text-xs text-amber-600 mt-2">
                                            Sources: auth/controllers/password.py:45, utils/email.py:123
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                                    <h4 className="font-bold text-gray-900 mb-4">Key Metrics</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-green-600 font-bold text-lg">Files</div>
                                            <div className="text-gray-600">Total indexed files</div>
                                        </div>
                                        <div>
                                            <div className="text-green-600 font-bold text-lg">Chunks</div>
                                            <div className="text-gray-600">Searchable segments</div>
                                        </div>
                                        <div>
                                            <div className="text-green-600 font-bold text-lg">Languages</div>
                                            <div className="text-gray-600">Composition breakdown</div>
                                        </div>
                                        <div>
                                            <div className="text-green-600 font-bold text-lg">Size</div>
                                            <div className="text-gray-600">Average chunk size</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="flex items-center mb-6">
                                    <BarChart3 className="text-green-500 mr-3" size={28} />
                                    <h3 className="text-2xl font-bold text-gray-900">How Analytics are Computed</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-600 leading-relaxed">
                                        CodeLens provides detailed analytics about your repository's structure and indexing performance.
                                        These metrics help you understand how your codebase is organized and optimized for AI-powered search.
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">File Analysis</h4>
                                            <p className="text-sm text-gray-600">Count and categorize all source files, identifying primary languages and frameworks.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Chunking Strategy</h4>
                                            <p className="text-sm text-gray-600">Break down large files into semantically meaningful chunks for optimal retrieval.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Performance Metrics</h4>
                                            <p className="text-sm text-gray-600">Track indexing time, chunk sizes, and search effectiveness.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Specifications */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Understanding the technical details behind CodeLens
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <Shield className="text-indigo-500 mr-3" size={24} />
                                <h3 className="text-lg font-bold text-gray-900">Security</h3>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Repository data encrypted at rest</li>
                                <li>• TLS 1.3 for data in transit</li>
                                <li>• JWT-based authentication</li>
                                <li>• Optional self-hosted deployment</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <Settings className="text-blue-500 mr-3" size={24} />
                                <h3 className="text-lg font-bold text-gray-900">Architecture</h3>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• FastAPI backend with Python</li>
                                <li>• React frontend with TypeScript</li>
                                <li>• FAISS vector database</li>
                                <li>• OpenRouter LLM integration</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <Zap className="text-amber-500 mr-3" size={24} />
                                <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Sub-second query response times</li>
                                <li>• Parallel processing for ingestion</li>
                                <li>• Intelligent caching strategies</li>
                                <li>• Optimized for repositories up to 10GB</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Experience AI-Powered Code Intelligence?
                    </h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        Start your free trial and see how CodeLens transforms your development workflow.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-50">
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/products">
                            <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
                                Explore Features
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