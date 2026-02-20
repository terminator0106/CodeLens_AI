import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, GitBranch, Zap, FileSearch, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BackgroundPaths } from '../components/ui/background-paths';
import { GridOverlay } from '../components/ui/grid-feature-cards';
import { TextType } from '../components/ui/TextType';
import { useAuthStore, useUIStore } from '../store';
import { Footer } from '../components/layout/Footer';

export const Landing: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useUIStore((state) => state.openAuthModal);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Code className="text-primary-foreground" size={24} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">CodeLens AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
              <Link to="/solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
              <Link to="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
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

      {/* Hero Section with Background Paths */}
      <div className="relative min-h-[600px] md:min-h-[700px]">
        <BackgroundPaths title="Code Intelligence" showTitle={false} />

        {/* Overlay content on top of background paths */}
        <div className="absolute top-0 left-0 right-0 flex flex-col justify-start pt-20 md:pt-24 pb-32 md:pb-40 z-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary/80 border border-border text-primary text-xs font-bold mb-8 uppercase tracking-wide shadow-card backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
              v2.0 Enterprise Edition
            </div>
            <h2 className="text-6xl md:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 drop-shadow-lg">
              <TextType
                as="span"
                text="Code Intelligence"
                typingSpeed={55}
                deletingSpeed={35}
                pauseDuration={1800}
                loop
                showCursor={false}
              />
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Instantly ingest, analyze, and document your entire codebase.
              Stop asking colleagues where the auth logic lives—ask CodeLens.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="shadow-card hover:shadow-float transition-shadow">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="shadow-card hover:shadow-float transition-shadow"
                  onClick={() => openAuthModal('signup')}
                >
                  Start Exploring Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Button
                variant="secondary"
                size="lg"
                className="bg-secondary/80 backdrop-blur-md"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Code className="mr-2 h-5 w-5 text-muted-foreground" />
                View Features
              </Button>
            </div>
          </div>
        </div>

        {/* Gradient fade to blend into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background z-10 pointer-events-none"></div>
      </div>

      {/* Interactive Demo Section */}
      <section className="relative -mt-16 pt-8 pb-24 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="relative bg-card rounded-2xl border border-border shadow-float overflow-hidden">
              {/* Demo Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 h-[500px]">
                {/* Code Viewer Panel (Left) */}
                <div className="border-r border-border bg-secondary/30 relative">
                  {/* Demo Label */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-card/90 backdrop-blur-sm text-muted-foreground border border-border shadow-card">
                      Interactive demo (illustrative)
                    </span>
                  </div>

                  {/* File Tab Header */}
                  <div className="bg-card border-b border-border px-4 py-3 flex items-center space-x-3 relative z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 flex items-center space-x-2 ml-4">
                      <div className="bg-secondary px-3 py-1.5 rounded-t-lg border-b-2 border-chart-blue">
                        <span className="text-sm font-medium text-foreground">auth/routes.py</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Content */}
                  <div className="p-4 h-[435px] bg-background overflow-hidden">
                    <div className="font-mono text-sm leading-[1.6] text-left">
                      <div className="flex">
                        <div className="text-muted-foreground select-none w-8 text-right pr-3 font-medium text-xs">
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
                          <div className="h-[22px] flex items-center"><span className="text-chart-blue">from</span> <span className="text-chart-purple">fastapi</span> <span className="text-chart-blue">import</span> <span className="text-foreground">APIRouter, HTTPException</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-chart-blue">from</span> <span className="text-chart-purple">fastapi.security</span> <span className="text-chart-blue">import</span> <span className="text-foreground">HTTPBearer</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-chart-blue">from</span> <span className="text-chart-purple">jose</span> <span className="text-chart-blue">import</span> <span className="text-foreground">JWTError, jwt</span></div>
                          <div className="h-[22px] flex items-center"></div>
                          <div className="h-[22px] flex items-center"><span className="text-muted-foreground"># Authentication router setup</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-foreground">router = APIRouter(prefix=</span><span className="text-chart-green">"/auth"</span><span className="text-foreground">)</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-foreground">security = HTTPBearer()</span></div>
                          <div className="h-[22px] flex items-center"></div>
                          <div className="h-[22px] flex items-center"><span className="text-chart-blue">async def</span> <span className="text-chart-purple">get_current_user</span><span className="text-foreground">(token: str):</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-muted-foreground">    """Extract user from JWT token"""</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-chart-blue">    try</span><span className="text-foreground">:</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-muted-foreground">        # Decode JWT and extract user info</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-foreground">        payload = jwt.decode(token, SECRET_KEY)</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-foreground">        username = payload.get(</span><span className="text-chart-green">"sub"</span><span className="text-foreground">)</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-chart-blue">        return</span> <span className="text-foreground">await get_user(username)</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-chart-blue">    except</span> <span className="text-foreground">JWTError:</span></div>
                          <div className="h-[22px] flex items-center"><span className="text-chart-blue">        raise</span> <span className="text-foreground">HTTPException(status_code=</span><span className="text-orange-500">401</span><span className="text-foreground">)</span></div>
                          <div className="h-[22px] flex items-center"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Chat Panel (Right) */}
                <div className="bg-card flex flex-col h-[500px]">
                  {/* Chat Header */}
                  <div className="border-b border-border px-6 py-4 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <MessageSquare size={16} className="text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">CodeLens AI</h3>
                        <p className="text-xs text-muted-foreground">Ask me about your codebase</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 p-6 space-y-5 overflow-hidden">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-md max-w-xs">
                        <p className="text-sm">How does authentication work in this repo?</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <Code size={14} className="text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-secondary px-4 py-3 rounded-2xl rounded-tl-md">
                          <p className="text-sm text-foreground leading-relaxed mb-3">
                            This repo uses <strong>JWT-based authentication</strong>:
                          </p>
                          <ul className="space-y-1 text-sm text-muted-foreground mb-3">
                            <li className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              <span><code className="text-primary bg-secondary px-1 rounded">get_current_user</code> validates JWT tokens</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
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
                          <p className="text-xs text-muted-foreground font-medium mb-1.5">Referenced files:</p>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1.5 bg-chart-blue text-chart-blue-foreground px-2.5 py-1 rounded-lg text-xs font-medium">
                              <span>📄</span>
                              <span>auth/routes.py</span>
                            </div>
                            <div className="flex items-center space-x-1.5 bg-chart-purple text-chart-purple-foreground px-2.5 py-1 rounded-lg text-xs font-medium">
                              <span>📄</span>
                              <span>auth/dependencies.py</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input (Read-only visual) */}
                  <div className="border-t border-border p-4 flex-shrink-0">
                    <div className="flex items-center space-x-3 bg-secondary rounded-lg px-4 py-3">
                      <div className="flex-1 text-sm text-muted-foreground">Ask about your codebase...</div>
                      <div className="w-8 h-8 bg-border rounded-lg flex items-center justify-center">
                        <ArrowRight size={16} className="text-muted-foreground" />
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
      <section className="py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Workflow</h2>
            <h3 className="text-3xl font-display font-bold text-foreground">From Code to Context in 3 Steps</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Connect", desc: "Link your GitHub or GitLab repository securely." },
              { step: "02", title: "Index", desc: "Our AI engine parses structure, dependencies, and logic." },
              { step: "03", title: "Query", desc: "Chat with your codebase or browse auto-generated docs." }
            ].map((item, i) => (
              <div key={i} className="relative overflow-hidden p-8 bg-black/40 backdrop-blur-sm rounded-2xl shadow-card border border-border ai-card hover:shadow-glow hover:scale-105 transition-all duration-300">
                <GridOverlay />
                <span className="text-6xl font-bold text-muted-foreground/20 absolute top-4 right-4 pointer-events-none z-5">{item.step}</span>
                <h4 className="text-xl font-bold text-foreground mb-3 relative z-10">{item.title}</h4>
                <p className="text-muted-foreground relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-display font-bold text-foreground mb-6">Engineered for Engineers.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl">Don't waste time reverse-engineering legacy code. We give you x-ray vision into complex systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <GitBranch className="text-foreground" size={24} />, title: "Repo Ingestion", desc: "Connect GitHub, GitLab, or Bitbucket. We parse trees up to 10GB in seconds." },
              { icon: <Zap className="text-foreground" size={24} />, title: "AI Explanations", desc: "Select any function or class and get a plain-English explanation of what it does." },
              { icon: <FileSearch className="text-foreground" size={24} />, title: "Dependency Mapping", desc: "Visual graph of how files import and depend on each other across modules." },
              { icon: <MessageSquare className="text-foreground" size={24} />, title: "Contextual Chat", desc: "Ask \"Where is the auth logic?\" and get a direct link to the file and line number." },
              { icon: <ShieldCheck className="text-foreground" size={24} />, title: "Security Scan", desc: "Automatically flag potential vulnerabilities in dependencies during ingestion." },
              { icon: <Code className="text-foreground" size={24} />, title: "Refactoring Tips", desc: "Get AI suggestions to modernize legacy patterns to new syntax." },
            ].map((feature, idx) => (
              <div key={idx} className="relative overflow-hidden p-8 rounded-2xl bg-black/40 backdrop-blur-sm border border-border ai-card hover:shadow-glow hover:scale-105 transition-all duration-300 group">
                <GridOverlay />
                <div className="relative z-10 group-hover:scale-110 transition-transform duration-300 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 font-display relative z-10">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm relative z-10">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};