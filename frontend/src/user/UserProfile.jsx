import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Shield,
  BarChart3,
  Users,
  Music,
  LogOut,
  Edit,
  LoaderCircle,
  TrendingUp,
  Clock,
  Heart,
  ChevronRight,
  Activity,
  Mail,
  Zap,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * Advanced Stat Card
 * Features adaptive theming and liquid background blurs
 */
const StatCard = ({ icon: Icon, label, value, trend, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative overflow-hidden p-6 rounded-3xl bg-white/70 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-xl group transition-all hover:shadow-xl dark:hover:shadow-violet-500/5"
  >
    <div className="relative z-10 flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
    {/* Decorative Liquid Element */}
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 dark:opacity-20 ${colorClass}`} />
  </motion.div>
);

const ActivityItem = ({ track }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-white/10">
    <div className="relative">
      <div className="w-12 h-12 flex items-center justify-center bg-violet-600/10 dark:bg-violet-400/10 rounded-xl overflow-hidden">
        <Music className="w-6 h-6 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-zinc-900 dark:text-white truncate text-sm sm:text-base">{track.title}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
        <Activity className="w-3 h-3" /> {track.category}
      </p>
    </div>
    <ChevronRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
  </div>
);

const UserProfileView = ({ profile, stats, recentTracks, logout }) => (
  <motion.div 
    initial="hidden" 
    animate="visible" 
    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    className="max-w-6xl mx-auto px-4"
  >
    {/* Header Section */}
    <motion.header
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="relative flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-white/80 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl dark:shadow-none mb-10 overflow-hidden backdrop-blur-md"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/5 blur-[80px] pointer-events-none" />
      
      <div className="relative group">
        <div className="absolute inset-0 bg-violet-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
        <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-violet-500 to-cyan-400 shadow-2xl">
          <img 
            src={`https://i.pravatar.cc/150?u=${profile.email}`} 
            alt={profile.name} 
            className="w-full h-full rounded-full border-4 border-white dark:border-zinc-900 object-cover" 
          />
        </div>
        <button className="absolute bottom-0 right-0 p-2.5 rounded-full bg-violet-600 text-white border-4 border-white dark:border-zinc-900 shadow-lg hover:scale-110 active:scale-95 transition-all">
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center md:text-left flex-1 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">
            {profile.name}
          </h1>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest">
            PRO
          </span>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
          <Mail className="w-4 h-4 text-violet-500" /> {profile.email}
        </p>
        <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-[10px] font-black uppercase tracking-wider border border-violet-200 dark:border-violet-500/20">
            <Zap className="w-3 h-3" /> Premium Member
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-wider border border-zinc-200 dark:border-white/10">
            <Award className="w-3 h-3" /> Early Adopter
          </div>
        </div>
      </div>
    </motion.header>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      <StatCard icon={BarChart3} label="Moods Logged" value={stats.moodsLogged} trend="+12%" colorClass="bg-violet-500" />
      <StatCard icon={Clock} label="Listening Time" value={stats.listeningTime} trend="+4h" colorClass="bg-cyan-500" />
      <StatCard icon={Heart} label="Favorite Style" value={stats.favoriteCategory} colorClass="bg-amber-500" />
    </div>

    {/* Detailed Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="lg:col-span-8">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-violet-600" /> Recent Activity
          </h2>
          <button className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 hover:underline">
            View All
          </button>
        </div>
        <div className="p-3 rounded-[2.5rem] bg-white/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 space-y-1 shadow-sm backdrop-blur-sm">
          {recentTracks.map(track => (
            <ActivityItem key={track.id} track={track} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} className="lg:col-span-4">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6 px-2 flex items-center gap-3">
          <Settings className="w-6 h-6 text-zinc-400" /> Account
        </h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-violet-500/50 transition-all group shadow-sm">
            <span className="flex items-center gap-4 font-bold text-zinc-700 dark:text-zinc-300">
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 group-hover:bg-violet-600/10 transition-colors">
                <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-violet-500" />
              </div>
              Personal Info
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-violet-500/50 transition-all group shadow-sm">
            <span className="flex items-center gap-4 font-bold text-zinc-700 dark:text-zinc-300">
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 group-hover:bg-violet-600/10 transition-colors">
                <Shield className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-violet-500" />
              </div>
              Privacy & Security
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="pt-4">
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm group active:scale-95"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const AdminDashboard = ({ user, stats, onOpenAdmin }) => (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="max-w-6xl mx-auto px-4"
    >
        <motion.header 
          variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }} 
          className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
        >
            <div>
              <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-xl shadow-amber-500/10">
                    <Shield className="w-8 h-8 text-amber-500"/>
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">Admin Hub</h1>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Monitoring platform health and user engagement.</p>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/80 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-none backdrop-blur-md">
               <div className="relative">
                  <img 
                    src={`https://i.pravatar.cc/100?u=${user.email}`} 
                    className="w-10 h-10 rounded-xl object-cover"
                    alt="admin"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Active Admin</p>
                  <p className="font-bold text-zinc-900 dark:text-white text-sm">{user.name}</p>
               </div>
            </div>
        </motion.header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} trend="+4.5%" colorClass="bg-violet-500" />
            <StatCard icon={Activity} label="Active Now" value={stats.activeSessions} colorClass="bg-cyan-500" />
            <StatCard icon={Music} label="Track Library" value={stats.totalTracks} colorClass="bg-amber-500" />
            <StatCard icon={TrendingUp} label="Daily Growth" value={stats.newSignupsToday} trend="+2" colorClass="bg-emerald-500" />
        </div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl dark:shadow-none backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 blur-[120px] pointer-events-none" />
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6 relative z-10">Platform Oversight</h2>
            <div className="p-12 rounded-[2rem] bg-zinc-50/50 dark:bg-white/5 border-2 border-dashed border-zinc-200 dark:border-white/10 flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-violet-600/10 flex items-center justify-center mb-6 shadow-inner">
                <Users className="w-10 h-10 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">User Management System</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">
                Review permissions, investigate reports, and monitor real-time system throughput from the centralized administration console.
              </p>
              <button onClick={onOpenAdmin} className="px-10 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl dark:shadow-none">
                Launch Admin Console
              </button>
            </div>
        </motion.div>
    </motion.div>
);

function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await api.get('/stats/profile');
        setProfileData(response.data);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] p-20 bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <div className="relative">
          <LoaderCircle className="w-16 h-16 animate-spin text-violet-600" />
          <div className="absolute inset-0 blur-xl bg-violet-500/20 animate-pulse rounded-full" />
        </div>
        <p className="mt-6 text-zinc-500 font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">Syncing Waves</p>
      </div>
    );
  }
  
  if (!user || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-10 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-zinc-200 dark:border-white/10 shadow-xl">
          <Shield className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">Session Expired</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-center max-w-xs leading-relaxed">Your session has timed out or you are not authorized. Please sign in again to continue.</p>
        <button onClick={() => navigate('/login')} className="px-12 py-5 rounded-3xl bg-violet-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all">
          Secure Login
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-950 min-h-screen transition-colors duration-500">
      <AnimatePresence mode="wait">
        {user.role === 'admin' && profileData.adminStats ? (
          <AdminDashboard key="admin" user={user} stats={profileData.adminStats} onOpenAdmin={() => navigate('/admin')} />
        ) : (
          <UserProfileView 
            key="user"
            profile={user} 
            stats={profileData.personalStats} 
            recentTracks={profileData.recentTracks}
            logout={logout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserProfile;
