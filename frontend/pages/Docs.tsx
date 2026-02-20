import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, BookOpen, GitBranch, MessageSquare, BarChart3, Settings, Search, FileText, Zap, Shield, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GridOverlay } from '../components/ui/grid-feature-cards';
import { TextType } from '../components/ui/TextType';
import { useAuthStore } from '../store';
import { Footer } from '../components/layout/Footer';

export const Docs: React.FC = () => {
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
                            <Link to="/docs" className="text-sm font-medium text-primary border-b-2 border-primary">Docs</Link>
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
                            text={"Documentation &\nGetting Started"}
                            typingSpeed={55}
                            deletingSpeed={35}
                            pauseDuration={1800}
                            loop
                            showCursor={false}
                        />
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                        Learn how to get the most out of CodeLens AI with comprehensive guides, tutorials, and technical documentation.
                    </p>
                </div>
            </section>

            {/* Quick Start */}
            <section className="py-16 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Quick Start Guide</h2>
                        <p className="text-xl text-muted-foreground">Get up and running in under 5 minutes</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl shadow-float border border-border p-6 text-center ai-card hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="bg-primary/20 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center relative z-10">
                                <Users className="text-foreground" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">1. Sign Up</h3>
                            <p className="text-muted-foreground text-sm relative z-10">
                                Create your free account and verify your email address. No credit card required.
                            </p>
                        </div>
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl shadow-float border border-border p-6 text-center ai-card hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="bg-primary/20 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center relative z-10">
                                <GitBranch className="text-foreground" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">2. Add Repository</h3>
                            <p className="text-muted-foreground text-sm relative z-10">
                                Connect your GitHub repository and let our AI parse and index your codebase.
                            </p>
                        </div>
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl shadow-float border border-border p-6 text-center ai-card hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="bg-primary/20 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center relative z-10">
                                <MessageSquare className="text-foreground" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">3. Start Chatting</h3>
                            <p className="text-muted-foreground text-sm relative z-10">
                                Ask questions about your code and get instant, contextual answers with file references.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Concepts */}
            <section className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Core Concepts</h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Understand the fundamentals of how CodeLens works
                        </p>
                    </div>

                    <div className="space-y-16">
                        {/* How Ingestion Works */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center mb-6">
                                    <GitBranch className="text-primary mr-3" size={28} />
                                    <h3 className="text-2xl font-bold text-foreground">How Repository Ingestion Works</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        When you connect a repository, CodeLens performs a deep analysis of your codebase:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-primary/30 text-primary rounded-full p-1 mt-1">
                                                <span className="text-xs font-bold px-1">1</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Repository Cloning</h4>
                                                <p className="text-sm text-muted-foreground">We securely clone your repository and analyze the file structure.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-primary/30 text-primary rounded-full p-1 mt-1">
                                                <span className="text-xs font-bold px-1">2</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Code Parsing</h4>
                                                <p className="text-sm text-muted-foreground">Extract syntax, dependencies, imports, and semantic structure.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-primary/30 text-primary rounded-full p-1 mt-1">
                                                <span className="text-xs font-bold px-1">3</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Intelligent Chunking</h4>
                                                <p className="text-sm text-muted-foreground">Break code into logical, searchable chunks that preserve context.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-primary/30 text-primary rounded-full p-1 mt-1">
                                                <span className="text-xs font-bold px-1">4</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Vector Embeddings</h4>
                                                <p className="text-sm text-muted-foreground">Generate embeddings for semantic search and AI-powered analysis.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/10 rounded-xl p-8 border border-primary/20">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Supported Languages</span>
                                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">20+</span>
                                    </div>
                                    <div className="text-sm text-foreground">
                                        Python, JavaScript, TypeScript, Go, Rust, Java, C++, PHP, Ruby, Swift, Kotlin, and more.
                                    </div>
                                    <div className="border-t border-primary/20 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Max Repository Size</span>
                                            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">10 GB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What is RAG */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="bg-primary/10 rounded-xl p-8 border border-primary/20">
                                    <h4 className="font-bold text-foreground mb-4">RAG Benefits</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                                            <span className="text-foreground">Grounded in your actual code</span>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                                            <span className="text-foreground">No hallucinated responses</span>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                                            <span className="text-foreground">Always up-to-date</span>
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                                            <span className="text-foreground">File references included</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="flex items-center mb-6">
                                    <MessageSquare className="text-primary mr-3" size={28} />
                                    <h3 className="text-2xl font-bold text-foreground">What is RAG (Retrieval-Augmented Generation)?</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        RAG combines the power of large language models with your specific codebase knowledge.
                                        Instead of relying solely on pre-trained knowledge, our AI retrieves relevant code snippets
                                        from your repository and uses them to provide accurate, contextual answers.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Unlike generic code assistants, CodeLens understands your specific architecture, naming
                                        conventions, and business logic because it's trained on your actual codebase.
                                    </p>
                                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                        <p className="text-sm text-foreground font-medium mb-1">Example Query:</p>
                                        <p className="text-sm text-foreground italic">"Where is the user authentication logic handled?"</p>
                                        <p className="text-xs text-muted-foreground mt-2">
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
                                    <Zap className="text-primary mr-3" size={28} />
                                    <h3 className="text-2xl font-bold text-foreground">How Chat is Grounded in Your Code</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        Every chat response is backed by actual code from your repository. Our system:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-primary/20 text-primary rounded-full p-1 mt-1">
                                                <Search size={12} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Semantic Search</h4>
                                                <p className="text-sm text-muted-foreground">Finds relevant code chunks based on your question's intent.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-primary/20 text-primary rounded-full p-1 mt-1">
                                                <FileText size={12} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Context Assembly</h4>
                                                <p className="text-sm text-muted-foreground">Combines relevant code snippets with your question for the AI.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-primary/20 text-primary rounded-full p-1 mt-1">
                                                <MessageSquare size={12} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Response Generation</h4>
                                                <p className="text-sm text-muted-foreground">AI generates answer based on your actual code, not general knowledge.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-primary/20 text-primary rounded-full p-1 mt-1">
                                                <BookOpen size={12} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">Source Citation</h4>
                                                <p className="text-sm text-muted-foreground">Includes file paths and line numbers for verification.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/10 rounded-xl p-8 border border-primary/20">
                                <h4 className="font-bold text-foreground mb-4">Sample Chat Interaction</h4>
                                <div className="space-y-3">
                                    <div className="bg-card rounded-lg p-3 border border-primary/20">
                                        <p className="text-sm text-foreground font-medium">You:</p>
                                        <p className="text-sm text-muted-foreground">"How does the password reset functionality work?"</p>
                                    </div>
                                    <div className="bg-primary/20 rounded-lg p-3 border border-primary/30">
                                        <p className="text-sm text-foreground font-medium">CodeLens:</p>
                                        <p className="text-sm text-muted-foreground">
                                            "The password reset flow is handled in multiple steps starting with the
                                            <code className="bg-primary/30 px-1 rounded">PasswordResetController</code>..."
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Sources: auth/controllers/password.py:45, utils/email.py:123
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="bg-primary/10 rounded-xl p-8 border border-primary/20">
                                    <h4 className="font-bold text-foreground mb-4">Key Metrics</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-accent font-bold text-lg">Files</div>
                                            <div className="text-muted-foreground">Total indexed files</div>
                                        </div>
                                        <div>
                                            <div className="text-accent font-bold text-lg">Chunks</div>
                                            <div className="text-muted-foreground">Searchable segments</div>
                                        </div>
                                        <div>
                                            <div className="text-accent font-bold text-lg">Languages</div>
                                            <div className="text-muted-foreground">Composition breakdown</div>
                                        </div>
                                        <div>
                                            <div className="text-accent font-bold text-lg">Size</div>
                                            <div className="text-muted-foreground">Average chunk size</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="flex items-center mb-6">
                                    <BarChart3 className="text-primary mr-3" size={28} />
                                    <h3 className="text-2xl font-bold text-foreground">How Analytics are Computed</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        CodeLens provides detailed analytics about your repository's structure and indexing performance.
                                        These metrics help you understand how your codebase is organized and optimized for AI-powered search.
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-medium text-foreground mb-1">File Analysis</h4>
                                            <p className="text-sm text-muted-foreground">Count and categorize all source files, identifying primary languages and frameworks.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-foreground mb-1">Chunking Strategy</h4>
                                            <p className="text-sm text-muted-foreground">Break down large files into semantically meaningful chunks for optimal retrieval.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-foreground mb-1">Performance Metrics</h4>
                                            <p className="text-sm text-muted-foreground">Track indexing time, chunk sizes, and search effectiveness.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Specifications */}
            <section className="py-20 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Technical Specifications</h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Understanding the technical details behind CodeLens
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl shadow-float border border-border p-6 ai-card hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-4 relative z-10">
                                <Shield className="text-foreground mr-3" size={24} />
                                <h3 className="text-lg font-bold text-foreground">Security</h3>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-2 relative z-10">
                                <li>• Repository data encrypted at rest</li>
                                <li>• TLS 1.3 for data in transit</li>
                                <li>• JWT-based authentication</li>
                                <li>• Optional self-hosted deployment</li>
                            </ul>
                        </div>
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl shadow-float border border-border p-6 ai-card hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-4 relative z-10">
                                <Settings className="text-foreground mr-3" size={24} />
                                <h3 className="text-lg font-bold text-foreground">Architecture</h3>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-2 relative z-10">
                                <li>• FastAPI backend with Python</li>
                                <li>• React frontend with TypeScript</li>
                                <li>• FAISS vector database</li>
                                <li>• OpenRouter LLM integration</li>
                            </ul>
                        </div>
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl shadow-float border border-border p-6 ai-card hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <GridOverlay />
                            <div className="flex items-center mb-4 relative z-10">
                                <Zap className="text-foreground mr-3" size={24} />
                                <h3 className="text-lg font-bold text-foreground">Performance</h3>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-2 relative z-10">
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
            <section className="py-20 bg-secondary/30 border-t border-border">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Ready to Experience AI-Powered Code Intelligence?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Start your free trial and see how CodeLens transforms your development workflow.
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