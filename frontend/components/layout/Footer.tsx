import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Code, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: 'Product',
    links: [
      { title: 'Features', href: '/products' },
      { title: 'Pricing', href: '/pricing' },
      { title: 'Docs', href: '/docs' },
      { title: 'Integrations', href: '#', external: true },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'Solutions', href: '/solutions' },
      { title: 'About Us', href: '#', external: true },
      { title: 'Privacy Policy', href: '#', external: true },
      { title: 'Terms of Service', href: '#', external: true },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Changelog', href: '#', external: true },
      { title: 'Blog', href: '#', external: true },
      { title: 'Help', href: '#', external: true },
      { title: 'Brand', href: '#', external: true },
    ],
  },
  {
    label: 'Social Links',
    links: [
      { title: 'Facebook', href: '#', icon: Facebook, external: true },
      { title: 'Instagram', href: '#', icon: Instagram, external: true },
      { title: 'Youtube', href: '#', icon: Youtube, external: true },
      { title: 'LinkedIn', href: '#', icon: Linkedin, external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative w-full border-t border-border bg-secondary/10">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 [mask-image:radial-gradient(35%_128px_at_50%_0%,white,transparent)] bg-foreground/5" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/20 blur" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
          <AnimatedContainer className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Code className="size-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">CodeLens AI</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} CodeLens AI. All rights reserved.
            </p>
          </AnimatedContainer>

          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
            {footerLinks.map((section, index) => (
              <div key={section.label}>
                <AnimatedContainer delay={0.1 + index * 0.1}>
                  <div className="mb-10 md:mb-0">
                    <h3 className="text-xs font-semibold tracking-wide text-foreground/80">{section.label}</h3>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {section.links.map((link) => (
                        <li key={link.title}>
                          {link.external || link.href.startsWith('#') ? (
                            <a
                              href={link.href}
                              className="inline-flex items-center transition-all duration-300 hover:text-foreground"
                            >
                              {link.icon && <link.icon className="me-1 size-4" />}
                              {link.title}
                            </a>
                          ) : (
                            <Link
                              to={link.href}
                              className="inline-flex items-center transition-all duration-300 hover:text-foreground"
                            >
                              {link.icon && <link.icon className="me-1 size-4" />}
                              {link.title}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedContainer>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', y: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
