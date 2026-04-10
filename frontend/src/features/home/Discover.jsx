import { motion } from 'framer-motion';
import { Brain, Moon, Sparkles } from 'lucide-react';

const features = [
  {
    title: 'Science-Backed Focus',
    description:
      'Carefully engineered soundscapes designed to improve concentration and mental clarity.',
    icon: Brain,
    accent: 'from-violet-500 to-indigo-500'
  },
  {
    title: 'Deep Relaxation',
    description:
      'Unwind your nervous system with calming audio crafted for stress relief and better sleep.',
    icon: Moon,
    accent: 'from-cyan-500 to-blue-500'
  },
  {
    title: 'Personalized Experience',
    description:
      'AI-driven recommendations that adapt to your mood, goals, and listening habits.',
    icon: Sparkles,
    accent: 'from-fuchsia-500 to-pink-500'
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

function Discover() {
  return (
    <section className="relative mt-24 sm:mt-32">

      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Section heading */}
        <motion.div
          variants={cardVariants}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Designed for Your{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Mental Well-Being
            </span>
          </h2>
          <p className="mt-4 text-secondary max-w-2xl mx-auto">
            DeepWave combines neuroscience, sound design, and personalization
            to help you feel better—every day.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="relative rounded-2xl p-6 surface border border-white/10 backdrop-blur-xl hover:bg-white/10 transition"
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${feature.accent} mb-5`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {feature.description}
                </p>

                {/* Subtle glow */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 hover:opacity-10 transition-opacity pointer-events-none`}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

export default Discover;
