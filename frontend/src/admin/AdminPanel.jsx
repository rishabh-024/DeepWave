import React, { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";
import axios from "axios";
import api from "../services/api";
import {
  FileUp,
  ListMusic,
  Music2,
  Search,
  TrendingUp,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

const AudioUploader = React.lazy(() => import("./AudioUploader"));

// use `api` instance (baseURL already contains /api)
// const TRACKS_API_URL = "http://localhost:4000/api/tracks";

const TrackListSkeleton = () => (
  <div className="space-y-3 animate-pulse" data-testid="loading-skeleton">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
        <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10" />
      </div>
    ))}
  </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-red-900/10 rounded-xl border border-red-500/20">
    <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
    <h3 className="text-xl font-bold text-white mb-1">An Error Occurred</h3>
    <p className="text-white/60 mb-6 max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
      >
        Try Again
      </button>
    )}
  </div>
);
ErrorDisplay.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

const StatCard = ({ icon: Icon, label, value, trend, color = "purple" }) => {
  const colorSchemes = {
    purple: "from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-300",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-300",
    amber: "from-amber-500/20 to-orange-500/20 border-amber-400/30 text-amber-300",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-br ${colorSchemes[color]} border backdrop-blur-md hover:-translate-y-1 transition-transform duration-300 group`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5 text-green-400 text-sm">
              <TrendingUp size={14} />
              <span>{trend} this week</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/10 group-hover:scale-110 transition-transform">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};
StatCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    trend: PropTypes.string,
    color: PropTypes.oneOf(['purple', 'blue', 'amber']),
};

const TrackItem = ({ track, onDelete, index }) => (
  <li
    className="group relative flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
    style={{ animation: `fadeInUp 0.5s ${index * 50}ms ease-out forwards`, opacity: 0 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
    <div className="relative flex items-center gap-4 flex-1 min-w-0">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-violet-500/30 flex items-center justify-center border border-purple-400/20">
        <Music2 className="w-6 h-6 text-purple-300" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold truncate group-hover:text-purple-200 transition-colors">
          {track.title}
        </h4>
        <p className="text-xs text-white/50">Track ID: {track._id || track.id}</p>
      </div>
    </div>
    <div className="relative flex-shrink-0 ml-4">
  <button onClick={() => onDelete(track._id || track.id)} className="p-2 rounded-full bg-red-900/20 hover:bg-red-900/50 text-red-400 transition-colors"><X size={16} /></button>
    </div>
  </li>
);
TrackItem.propTypes = {
  track: PropTypes.shape({ id: PropTypes.any.isRequired, title: PropTypes.string.isRequired }).isRequired,
  onDelete: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-center p-12 bg-white/5 rounded-xl border border-white/10">
    <Music2 className="w-12 h-12 text-purple-400 mb-4" />
    <p className="text-white/60">{message}</p>
  </div>
);
EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

const AdminPanel = () => {
  const { user, token } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [status, setStatus] = useState("loading"); // 'loading', 'error', 'success'
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("manage");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTracks = useCallback(async () => {
    setStatus("loading");
    if (!token) {
      setError("Authentication token is missing. Please log in again.");
      setStatus("error");
      return;
    }
    try {
      const response = await api.get('/tracks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // normalize to use _id consistently
      const backendTracks = response.data.tracks || [];
      setTracks(backendTracks.map(t => ({ ...t, id: t._id || t.id })));
      setStatus("success");
    } catch (err) {
      setError("Failed to load tracks. Please check the API connection and try again.");
      setStatus("error");
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchTracks();
    }
  }, [user, fetchTracks]);

  const handleTrackDelete = useCallback((deletedTrackId) => {
    setTracks((prev) => prev.filter((track) => track.id !== deletedTrackId));
  }, []);

  const handleUploadSuccess = useCallback(() => {
    fetchTracks();
    setActiveTab("manage");
  }, [fetchTracks]);

  const filteredTracks = useMemo(() =>
    tracks.filter((track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), [tracks, searchQuery]);

  const renderContent = () => {
    if (status === "loading") {
      return <TrackListSkeleton />;
    }
    if (status === "error") {
      return <ErrorDisplay message={error} onRetry={fetchTracks} />;
    }
    if (activeTab === "manage") {
      return (
        <div className="animate-fadeIn">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by track title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          {filteredTracks.length > 0 ? (
            <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTracks.map((track, index) => (
                  <TrackItem key={track._id || track.id || index} track={track} onDelete={handleTrackDelete} index={index} />
                ))}
            </ul>
          ) : (
            <EmptyState message={searchQuery ? "No tracks match your search." : "Your library is empty. Upload a track!"} />
          )}
        </div>
      );
    }
    if (activeTab === "upload") {
      return (
        <div className="animate-fadeIn">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border-2 border-dashed border-purple-500/30 p-8 hover:border-purple-500/50 transition-colors">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                  <p className="text-white/60">Loading Uploader Interface...</p>
                </div>
              }
            >
              <AudioUploader onUploadSuccess={handleUploadSuccess} />
            </Suspense>
          </div>
        </div>
      );
    }
    return null;
  };
  
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <section className="relative p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/20">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-purple-200 to-violet-200 bg-clip-text text-transparent">
            Admin Console
          </h1>
        </div>
        <p className="text-white/60 md:ml-16">
          Your central hub for managing the audio library and content.
        </p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Music2} label="Total Tracks" value={tracks.length} color="purple" />
        <StatCard icon={Clock} label="Added This Month" value="8" trend="+2" color="blue" />
        <StatCard icon={TrendingUp} label="Most Popular" value="Song Title" color="amber" />
      </div>

      <nav className="flex gap-2 mb-6 p-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
        <TabButton active={activeTab === "manage"} onClick={() => setActiveTab("manage")} icon={ListMusic} label="Manage Tracks" />
        <TabButton active={activeTab === "upload"} onClick={() => setActiveTab("upload")} icon={FileUp} label="Upload New" />
      </nav>

      <main className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 min-h-[300px]">
        {renderContent()}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(147, 51, 234, 0.5); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(147, 51, 234, 0.7); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`relative flex-1 flex items-center justify-center gap-2.5 px-4 py-3 font-semibold rounded-lg transition-all duration-300 group ${
      active ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
    }`}
  >
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg shadow-lg" />
    )}
    <Icon className={`relative z-10 w-5 h-5 transition-colors ${active ? "text-purple-300" : ""}`} />
    <span className="relative z-10">{label}</span>
  </button>
);
TabButton.propTypes = {
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
};

export default AdminPanel;