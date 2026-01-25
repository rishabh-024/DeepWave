import { useState, useEffect, useCallback } from 'react';
import { Moon, Heart, Brain, Zap, Sunrise } from 'lucide-react';

import api from '../services/api';

const fetchDashboardData = async () => {
  const currentTime = new Date();
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return {
    greeting: getGreeting(),
    brainwaveActions: [
      { label: 'Deep Sleep', brainwave: 'Delta', icon: Moon, path: '/mood-journal?goal=delta', description: 'Promotes restorative sleep' },
      { label: 'De-stress', brainwave: 'Theta', icon: Heart, path: '/mood-journal?goal=theta', description: 'Reduces anxiety & promotes relaxation' },
      { label: 'Focus', brainwave: 'Alpha', icon: Brain, path: '/mood-journal?goal=alpha', description: 'Enhances calm concentration' },
      { label: 'Energy', brainwave: 'Beta', icon: Zap, path: '/mood-journal?goal=beta', description: 'Boosts alertness & productivity' },
      { label: 'Creativity', brainwave: 'Gamma', icon: Sunrise, path: '/mood-journal?goal=gamma', description: 'Supports complex problem-solving' },
    ],
    recommendedTrack: {
      id: 'rec-1',
      title: 'Deep Focus Flow',
      category: 'Binaural Beats',
      brainwave: 'Alpha',
      duration: '30 min',
      cover: 'https://via.placeholder.com/150/8a2be2/ffffff?text=Alpha',
      storageUrl: '/api/sounds/stream/dummy-alpha-id',
      description: "A specially designed binaural beat to help you achieve peak Alpha brainwave states for enhanced focus and productivity."
    },
    mindTrends: {
      averageBrainwave: 'Alpha',
      moodShift: '+10% calmer last week',
      longestStreak: '7-day consistency streak',
      chartData: [ ]
    },
    upcomingSessions: [
      { id: 'session-1', time: 'Today, 8:00 PM', title: 'Delta Wave Sleep Aid', icon: Moon },
      { id: 'session-2', time: 'Tomorrow, 9:00 AM', title: 'Alpha Focus Session', icon: Zap },
    ],
    exploreNewWaves: [
      { id: 'track-new-1', title: 'Cosmic Drift', brainwave: 'Theta', cover: 'https://via.placeholder.com/100/9370db/ffffff?text=Theta' },
      { id: 'track-new-2', title: 'Gamma Boost', brainwave: 'Gamma', cover: 'https://via.placeholder.com/100/ba55d3/ffffff?text=Gamma' },
      { id: 'track-new-3', title: 'Oceanic Calm', brainwave: 'Alpha', cover: 'https://via.placeholder.com/100/da70d6/ffffff?text=Alpha' },
      { id: 'track-new-4', title: 'Relaxing Rain', brainwave: 'Theta', cover: 'https://via.placeholder.com/100/7b68ee/ffffff?text=Rain' },
    ],
  };
};

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
  const response = await api.get('/stats/dashboard');
      setData({ mindTrends: response.data.stats });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refreshData };
};