import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, GitBranch, Terminal, Zap, FileSearch, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Code className="text-white" size={24} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-gray-900">CodeLens AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Product</a>
              <a href="#solutions" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Solutions</a>
              <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Pricing</a>
              <a href="#docs" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Docs</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link to="/signup">
                <Button size="md">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-primary text-xs font-bold mb-8 uppercase tracking-wide shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
            v2.0 Enterprise Edition
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
            The documentation that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">writes itself.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Instantly ingest, analyze, and document your entire codebase. 
            Stop asking colleagues where the auth logic lives—ask CodeLens.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup">
              <Button size="lg" className="shadow-xl shadow-indigo-200/50 hover:shadow-indigo-200/70 transition-shadow">
                Start Exploring Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="bg-white">
              <Terminal className="mr-2 h-5 w-5 text-gray-400" />
              run npm install
            </Button>
          </div>
          
          <div className="mt-20 relative rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-gray-900 aspect-[16/9] max-w-5xl mx-auto group">
             <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-900 to-indigo-900/20"></div>
             <div className="relative p-4 md:p-8 flex flex-col items-center justify-center h-full text-center">
                <Code size={64} className="text-white/20 mb-4 group-hover:text-primary/50 transition-colors duration-500" />
                <p className="text-gray-400 font-mono text-sm">Interactive Demo Preview</p>
             </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Workflow</h2>
                <h3 className="text-3xl font-display font-bold text-gray-900">From Code to Context in 3 Steps</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                      { step: "01", title: "Connect", desc: "Link your GitHub or GitLab repository securely." },
                      { step: "02", title: "Index", desc: "Our AI engine parses structure, dependencies, and logic." },
                      { step: "03", title: "Query", desc: "Chat with your codebase or browse auto-generated docs." }
                  ].map((item, i) => (
                      <div key={i} className="relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                          <span className="text-6xl font-bold text-gray-100 absolute top-4 right-4 pointer-events-none">{item.step}</span>
                          <h4 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{item.title}</h4>
                          <p className="text-gray-500 relative z-10">{item.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">Engineered for Engineers.</h2>
            <p className="text-xl text-gray-500 max-w-2xl">Don't waste time reverse-engineering legacy code. We give you x-ray vision into complex systems.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <GitBranch className="text-white" size={20} />, color: "bg-blue-500", title: "Repo Ingestion", desc: "Connect GitHub, GitLab, or Bitbucket. We parse trees up to 10GB in seconds." },
              { icon: <Zap className="text-white" size={20} />, color: "bg-amber-500", title: "AI Explanations", desc: "Select any function or class and get a plain-English explanation of what it does." },
              { icon: <FileSearch className="text-white" size={20} />, color: "bg-purple-500", title: "Dependency Mapping", desc: "Visual graph of how files import and depend on each other across modules." },
              { icon: <Terminal className="text-white" size={20} />, color: "bg-gray-800", title: "Contextual Chat", desc: "Ask \"Where is the auth logic?\" and get a direct link to the file and line number." },
              { icon: <ShieldCheck className="text-white" size={20} />, color: "bg-green-500", title: "Security Scan", desc: "Automatically flag potential vulnerabilities in dependencies during ingestion." },
              { icon: <Code className="text-white" size={20} />, color: "bg-indigo-500", title: "Refactoring Tips", desc: "Get AI suggestions to modernize legacy patterns to new syntax." },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-soft transition-all duration-300 group">
                <div className={`h-10 w-10 ${feature.color} rounded-lg flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 font-display">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start">
          <div className="mb-8 md:mb-0">
             <div className="flex items-center space-x-2 mb-4">
                 <div className="bg-primary p-1.5 rounded-lg">
                    <Code className="text-white" size={20} />
                  </div>
                <span className="font-bold text-gray-900 text-lg">CodeLens AI</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">Intelligent documentation for modern engineering teams.</p>
          </div>
          <div className="flex space-x-12">
             <div>
                 <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                 <ul className="space-y-2 text-sm text-gray-500">
                     <li><a href="#" className="hover:text-primary">Features</a></li>
                     <li><a href="#" className="hover:text-primary">Pricing</a></li>
                     <li><a href="#" className="hover:text-primary">Changelog</a></li>
                 </ul>
             </div>
             <div>
                 <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                 <ul className="space-y-2 text-sm text-gray-500">
                     <li><a href="#" className="hover:text-primary">About</a></li>
                     <li><a href="#" className="hover:text-primary">Careers</a></li>
                     <li><a href="#" className="hover:text-primary">Blog</a></li>
                 </ul>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-400">&copy; 2024 CodeLens Inc.</div>
        </div>
      </footer>
    </div>
  );
};