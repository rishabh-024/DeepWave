import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

function Preferences() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="relative">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/15 blur-[160px] rounded-full" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="max-w-4xl mx-auto px-4 sm:px-6"
      >
        <div className="relative rounded-3xl p-10 sm:p-14 surface backdrop-blur-xl text-center overflow-hidden">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full surface mb-6">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm text-secondary">
              Personalized Experience
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Design Your Personal{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Wellness Journey
            </span>
          </h2>

          {/* Description */}
          <p className="mt-5 text-secondary max-w-2xl mx-auto">
            Tell us how you feel, what you want to improve, and how you prefer
            to listen. DeepWave adapts to you—every step of the way.
          </p>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleClick}
            className="mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 transition"
          >
            <Sliders className="h-5 w-5" />
            {isAuthenticated ? 'Customize My Experience' : 'Get Started'}
            <ArrowRight className="h-5 w-5" />
          </motion.button>

          {/* Subtext */}
          <p className="mt-4 text-sm text-secondary">
            Takes less than a minute. You’re always in control.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default Preferences;
