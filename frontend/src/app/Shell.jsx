import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from "../layout/header/Navbar";
import Footer from "../layout/footer/Footer";
import PlayerBar from '../layout/PlayerBar';
import Chatbot from '../chatbot/Chatbot';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

function Shell({ children }) {
  const location = useLocation();

  return (
    <div
      className="min-h-screen overflow-x-hidden text-primary transition-colors duration-300"
      style={{ backgroundColor: 'rgb(var(--bg-primary))' }}
    >
      <div className="absolute top-0 left-0 -z-10 h-full w-full">
        <div className="absolute top-0 left-[-20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(139,92,246,0.1),transparent)] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-[-20%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(34,211,238,0.1),transparent)] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      </div>

      <Navbar />
      <Chatbot />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 "
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          transition={pageTransition}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <PlayerBar />
      <Footer />
    </div>
  );
}

export default Shell;
