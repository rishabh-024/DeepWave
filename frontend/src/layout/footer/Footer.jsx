import React from 'react';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Github, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Mail, 
  ArrowRight,
  Globe
} from "lucide-react";

/**
 * Advanced Adaptive Footer
 * Features: Newsletter signup, liquid glass styling, and full theme support.
 */

const SocialLink = ({ href, icon: Icon, label }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.9 }}
    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white transition-all duration-300"
    aria-label={label}
  >
    <Icon className="h-5 w-5" />
  </motion.a>
);

const FooterLink = ({ href, children }) => {
  const className = "text-sm text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-white transition-colors duration-200 flex items-center group";

  return (
    <li>
      {href.startsWith('http') ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
          {children}
        </a>
      ) : (
        <Link to={href} className={className}>
          <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
          {children}
        </Link>
      )}
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 transition-colors duration-500">
      {/* Liquid Background Decorations */}
      <div className="absolute top-0 left-1/4 -z-10 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Brand & Newsletter Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                Deep<span className="text-violet-600 dark:text-violet-400">Wave</span>
              </span>
            </div>
            
            <p className="max-w-xs text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Transforming your mental space through scientific sound therapy and immersive auditory experiences.
            </p>

            <div className="max-w-md">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Subscribe to our newsletter</h3>
              <form className="flex gap-x-2" onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full rounded-xl border-0 bg-zinc-100 dark:bg-white/5 px-10 py-2.5 text-sm text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 transition-all outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-violet-600 transition-all"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <FooterLink href="/#library">Sound Library</FooterLink>
                  <FooterLink href="/dashboard">Wave Studio</FooterLink>
                  <FooterLink href="/register">Premium Plans</FooterLink>
                  <FooterLink href="/profile">Member Profile</FooterLink>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Resources</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <FooterLink href="/#recommendations">Recommendations</FooterLink>
                  <FooterLink href="/dashboard">Mood Tracking</FooterLink>
                  <FooterLink href="/dashboard">Guided Sessions</FooterLink>
                  <FooterLink href="https://github.com/rishabh-giri">Developer Profile</FooterLink>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <FooterLink href="/">Our Story</FooterLink>
                  <FooterLink href="/register">Start Free</FooterLink>
                  <FooterLink href="/login">Sign In</FooterLink>
                  <FooterLink href="/profile">Contact Settings</FooterLink>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <FooterLink href="/register">Privacy First</FooterLink>
                  <FooterLink href="/login">Secure Access</FooterLink>
                  <FooterLink href="/profile">Account Controls</FooterLink>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-zinc-200 dark:border-white/10 pt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
          
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
            <Globe className="h-3 w-3" />
            <span>English (US)</span>
            <span className="mx-2">|</span>
            <p>© {new Date().getFullYear()} DeepWave Inc. Built by <span className="font-bold text-zinc-900 dark:text-zinc-300">Rishabh Giri</span></p>
          </div>

          <div className="flex items-center gap-4">
            <SocialLink href="https://twitter.com" icon={Twitter} label="Twitter" />
            <SocialLink href="https://youtube.com" icon={Youtube} label="YouTube" />
            <SocialLink href="https://github.com/rishabh-giri" icon={Github} label="GitHub" />
            <SocialLink href="https://linkedin.com" icon={Linkedin} label="LinkedIn" />
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
