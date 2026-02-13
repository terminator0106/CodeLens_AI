import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, GitBranch, Zap, FileSearch, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store';

export const Landing: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
              <Link to="/products" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Products</Link>
              <Link to="/solutions" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Solutions</Link>
              <Link to="/pricing" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Pricing</Link>
              <Link to="/docs" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Docs</Link>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button size="md">Go to Dashboard</Button>
                  </Link>
                </>
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
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button size="lg" className="shadow-xl shadow-indigo-200/50 hover:shadow-indigo-200/70 transition-shadow">
                {isAuthenticated ? 'Go to Dashboard' : 'Start Exploring Free'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Code className="mr-2 h-5 w-5 text-gray-400" />
              View Features
            </Button>
          </div>

          {/* Interactive Demo Section */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
              {/* Demo Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 h-[500px]">
                {/* Code Viewer Panel (Left) */}
                <div className="border-r border-gray-200 bg-gray-50/30 relative">
                  {/* Demo Label */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-600 border border-gray-200 shadow-sm">
                      Interactive demo (illustrative)
                    </span>
                  </div>

                  {/* File Tab Header */}
                  <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3 relative z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 flex items-center space-x-2 ml-4">
                      <div className="bg-gray-100 px-3 py-1.5 rounded-t-lg border-b-2 border-blue-500">
                        <span className="text-sm font-medium text-gray-700">auth/routes.py</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Content */}
                  <div className="p-4 h-[435px] bg-white overflow-hidden">
                    <div className="font-mono text-sm leading-[1.6] text-left">
                      <div className="flex">
                        <div className="text-gray-400 select-none w-8 text-right pr-3 font-medium text-xs">
                          <div className="h-[22px] flex items-center">1</div>
                          <div className="h-[22px] flex items-center">2</div>
                          <div className="h-[22px] flex items-center">3</div>
                          <div className="h-[22px] flex items-center">4</div>
                          <div className="h-[22px] flex items-center">5</div>
                          <div className="h-[22px] flex items-center">6</div>
                          <div className="h-[22px] flex items-center">7</div>
                          <div className="h-[22px] flex items-center">8</div>
                          <div className="h-[22px] flex items-center">9</div>
                          <div className="h-[22px] flex items-center">10</div>
                          <div className="h-[22px] flex items-center">11</div>
                          <div className="h-[22px] flex items-center">12</div>
                          <div className="h-[22px] flex items-center">13</div>
                          <div className="h-[22px] flex items-center">14</div>
                          <div className="h-[22px] flex items-center">15</div>
                          <div className="h-[22px] flex items-center">16</div>
                          <div className="h-[22px] flex items-center">17</div>
                          <div className="h-[22px] flex items-center">18</div>
                        </div>
                        <div className="flex-1">
                          <div className="h-[22px] flex items-center"><span className="text-blue-600">from</span> <span className="text-purple-600">fastapi</span> <span className="text-blue-600">import</span> <span className="text-gray-900">APIRouter, HTTPException</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-blue-600">from</span> <span className="text-purple-600">fastapi.security</span> <span className="text-blue-600">import</span> <span className="text-gray-900">HTTPBearer</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-blue-600">from</span> <span className="text-purple-600">jose</span> <span className="text-blue-600">import</span> <span className="text-gray-900">JWTError, jwt</span></div>
                          <div className="h-[22px] flex items-center"></div>
                          <div className="h-[22px] flex items-center"><span className="text-gray-500"># Authentication router setup</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-gray-900">router = APIRouter(prefix=</span><span className="text-green-600">"/auth"</span><span className="text-gray-900">)</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-gray-900">security = HTTPBearer()</span></div>
                          <div className="h-[22px] flex items-center"></div>
                          <div className="h-[22px] flex items-center"><span className="text-blue-600">async def</span> <span className="text-purple-600">get_current_user</span><span className="text-gray-900">(token: str):</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-gray-500">    """Extract user from JWT token"""</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-blue-600">    try</span><span className="text-gray-900">:</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-gray-500">        # Decode JWT and extract user info</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-gray-900">        payload = jwt.decode(token, SECRET_KEY)</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-gray-900">        username = payload.get(</span><span className="text-green-600">"sub"</span><span className="text-gray-900">)</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-blue-600">        return</span> <span className="text-gray-900">await get_user(username)</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-blue-600">    except</span> <span className="text-gray-900">JWTError:</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-blue-600">        raise</span> <span className="text-gray-900">HTTPException(status_code=</span><span className="text-orange-500">401</span><span className="text-gray-900">)</span></div>
                          <div className="h-[22px] flex items-center"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Chat Panel (Right) */}
                <div className="bg-white flex flex-col h-[500px]">
                  {/* Chat Header */}
                  <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <MessageSquare size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">CodeLens AI</h3>
                        <p className="text-xs text-gray-500">Ask me about your codebase</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 p-6 space-y-5 overflow-hidden">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-md max-w-xs">
                        <p className="text-sm">How does authentication work in this repo?</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Code size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-md">
                          <p className="text-sm text-gray-900 leading-relaxed mb-3">
                            This repo uses <strong>JWT-based authentication</strong>:
                          </p>
                          <ul className="space-y-1 text-sm text-gray-700 mb-3">
                            <li className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span><code className="text-indigo-600 bg-indigo-50 px-1 rounded">get_current_user</code> validates JWT tokens</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>Extracts username from token "sub" field</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>Returns 401 for invalid tokens</span>
                            </li>
                          </ul>
                        </div>

                        {/* Referenced Files */}
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-medium mb-1.5">Referenced files:</p>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                              <span>📄</span>
                              <span>auth/routes.py</span>
                            </div>
                            <div className="flex items-center space-x-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                              <span>📄</span>
                              <span>auth/dependencies.py</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input (Read-only visual) */}
                  <div className="border-t border-gray-200 p-4 flex-shrink-0">
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-3">
                      <div className="flex-1 text-sm text-gray-400">Ask about your codebase...</div>
                      <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                        <ArrowRight size={16} className="text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              { icon: <MessageSquare className="text-white" size={20} />, color: "bg-gray-800", title: "Contextual Chat", desc: "Ask \"Where is the auth logic?\" and get a direct link to the file and line number." },
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