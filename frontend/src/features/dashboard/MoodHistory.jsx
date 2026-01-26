import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Calendar, Smile, Frown, Meh, Angry, Annoyed, Activity } from 'lucide-react';

const moodConfig = {
    happy: { icon: <Smile />, color: 'border-l-green-400' },
    calm: { icon: <Meh />, color: 'border-l-sky-400' },
    stressed: { icon: <Annoyed />, color: 'border-l-yellow-400' },
    angry: { icon: <Angry />, color: 'border-l-red-400' },
    sad: { icon: <Frown />, color: 'border-l-blue-400' },
    default: { icon: <Meh />, color: 'border-l-gray-500' },
};

const getMoodHistory = async () => {
    try {
    const response = await api.get('/moods/history');
    return response.data.history || response.data || [];
    } catch (error) {
        console.error('Error fetching mood history:', error);
        return [];
    }
};

const MoodHistorySkeleton = () => (
    <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="space-y-3"
    >
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-white/5 flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-slate-700/50 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-slate-700/50 rounded" />
                    <div className="h-2 w-1/2 bg-slate-700/50 rounded" />
                </div>
            </div>
        ))}
    </motion.div>
);

const MoodHistory = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await getMoodHistory();
                if (mounted) {
                    setHistory(data);
                }
            } catch (error) {
                console.error('Failed to fetch mood history:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchHistory();

        const interval = setInterval(fetchHistory, 5 * 60 * 1000);
        
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-cyan-300" />
                <h3 className="text-xl font-bold text-white">Recent Moods</h3>
            </div>

            {isLoading ? <MoodHistorySkeleton /> : 
             history.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl">
                    <Calendar className="mx-auto h-10 w-10 text-gray-500" />
                    <h4 className="mt-4 text-md font-semibold text-white">No History Yet</h4>
                    <p className="mt-1 text-sm text-gray-400">Log your mood to see your journey here.</p>
                </div>
            ) : (
                <motion.ul
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    {history.map((entry) => {
                        const { icon, color } = moodConfig[entry.mood] || moodConfig.default;
                        return (
                            <motion.li
                                key={entry._id}
                                className={`p-3 rounded-lg bg-white/5 border-l-4 flex items-center gap-4 ${color}`}
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                            >
                                <div className="text-white/80">{React.cloneElement(icon, { className: "h-6 w-6" })}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-semibold text-white capitalize">{entry.mood}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    {entry.notes && <p className="mt-1 text-sm text-gray-300 italic">"{entry.notes}"</p>}
                                </div>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            )}
        </div>
    );
};

export default MoodHistory;