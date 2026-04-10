import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Sparkles, X, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

const suggestions = [
  'Deep Focus',
  'Calm Mind',
  'Sleep Better',
  'Nature Sounds',
  'Anxiety Relief'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

function Hero({ onSearch, onSuggestionClick }) {
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  
  // Parallax effect for the background orbs
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const handleSuggestion = (text) => {
    setQuery(text);
    onSuggestionClick(text);
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center bg-transparent transition-colors duration-500"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute -top-40 -left-40 w-[35rem] h-[35rem]
          rounded-full bg-violet-500/10 dark:bg-violet-600/20 blur-[140px]"
        />

        <motion.div 
          style={{ y: y2 }}
          className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem]
          rounded-full bg-cyan-400/10 dark:bg-cyan-500/20 blur-[140px]"
        />
      </div>

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 mb-8">
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            AI-Powered Wellbeing
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Heal Your Mind with
          <span className="block mt-2 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Intelligent Soundscapes
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="mt-8 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Discover science-backed audio environments designed to help you 
          <span className="text-slate-900 dark:text-slate-200 font-medium"> focus, relax, and sleep</span> deeper than ever before.
        </motion.p>

        {/* Search Bar Refined */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="mt-12 max-w-2xl mx-auto group"
        >
          <div className="relative flex items-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2"
            >
              <Search className="w-5 h-5 text-slate-500 transition-colors group-focus-within:text-violet-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you feeling today?"
              className="w-full pl-14 pr-32 py-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 backdrop-blur-md focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-sm group-hover:shadow-md"
            />
            
            <div className="absolute right-3 flex items-center gap-2">
              {query && (
                <button 
                  type="button" 
                  onClick={() => setQuery('')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.form>

        {/* Suggestions */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <span className="w-full text-sm text-slate-500 dark:text-slate-500 mb-2">Try searching for:</span>
          {suggestions.map((text) => (
            <motion.button
              key={text}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSuggestion(text)}
              className="px-5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-500 transition-colors shadow-sm"
            >
              {text}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Subtle Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-transparent via-transparent to-transparent pointer-events-none" />
    </section>
  );
}

Hero.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onSuggestionClick: PropTypes.func.isRequired
};

export default Hero;
