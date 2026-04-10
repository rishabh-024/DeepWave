import { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../../context/AuthContext';
import { useAudioPlayer } from '../../context/AudioContext';
import { useNavigate, Link } from "react-router-dom";
import { LogOut, ArrowLeft, Sparkles, Activity, Award, Target } from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";
import { normalizeTrack, normalizeTrackList } from "../../services/trackService";
import StatCard from "./Stats/StatCard";
import MoodLogger from "./MoodLogger";
import MoodHistory from "./MoodHistory";
import TherapySession from "./TherapySession";

const FloatingOrbs = memo(() => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute top-1/4 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite]" />
    <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite_reverse]" />
  </div>
));

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { playTrack } = useAudioPlayer();
  const navigate = useNavigate();
  const { data } = useDashboardData();
  const [activeSession, setActiveSession] = useState(null);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const handleMoodLogged = useCallback((sessionData) => {
    setActiveSession(sessionData);
  }, []);

  const handleSessionEnd = useCallback(() => {
    setActiveSession(null);
  }, []);

  const handlePlayTrack = useCallback((track) => {
    const playlist = normalizeTrackList(activeSession?.recommendations || []);
    playTrack(normalizeTrack(track), playlist);
  }, [activeSession?.recommendations, playTrack]);

  const welcomeMessage = useMemo(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    return `${greeting}, ${user?.name ?? "User"}`;
  }, [user?.name]);

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#0a0e1a] dark:text-white">
      <FloatingOrbs />
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-500/30">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-white dark:to-white/60 sm:text-4xl">
                {welcomeMessage}
              </h1>
              <p className="text-slate-500 dark:text-white/60">Let&apos;s take a moment for your well-being.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-medium backdrop-blur-xl transition-all hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Library
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-red-500/10 text-red-300 rounded-full hover:bg-red-500/20 transition-all border border-red-500/30"
            >
              <LogOut className="h-4 w-4" /> Logout
            </motion.button>
          </div>
        </motion.header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Activity} label="Moods Logged" value={data?.mindTrends?.moodsLogged || 0} trend={data?.mindTrends?.moodShift || '+0%'} color="purple" />
          <StatCard icon={Sparkles} label="Calm Score" value={data?.mindTrends?.calmScore || 0} trend="+5 this week" color="blue" />
          <StatCard icon={Award} label="Streak" value={`${data?.mindTrends?.longestStreak || 0} days`} trend="+consistency" color="green" />
          <StatCard icon={Target} label="Weekly Avg" value={`${data?.mindTrends?.weeklyAverage || 0} / day`} color="orange" />
        </section>

        {/* Main Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Session workspace */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 dark:shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSession ? "session" : "logger"}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeSession ? (
                    <TherapySession
                      sessionData={activeSession}
                      onEndSession={handleSessionEnd}
                      onPlayTrack={handlePlayTrack}
                    />
                  ) : (
                    <MoodLogger onMoodLogged={handleMoodLogged} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

          </div>

          {/* Mood History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 dark:shadow-2xl"
          >
            <MoodHistory />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
