import React, { useState } from 'react';
import { logMood } from '../../services/moodService'; // Assuming this service exists
import { motion } from 'framer-motion';
import { Smile, Frown, Meh, Angry, Annoyed, MessageSquarePlus } from 'lucide-react';

const MOOD_OPTIONS = [
    { name: 'happy', icon: <Smile className="h-6 w-6" /> },
    { name: 'calm', icon: <Meh className="h-6 w-6" /> },
    { name: 'stressed', icon: <Annoyed className="h-6 w-6" /> },
    { name: 'angry', icon: <Angry className="h-6 w-6" /> },
    { name: 'sad', icon: <Frown className="h-6 w-6" /> },
];

const MoodLogger = ({ onMoodLogged }) => {
    const [notes, setNotes] = useState('');
    const [selectedMood, setSelectedMood] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMood) {
            setError('Please select a mood to continue.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const sessionData = await logMood({ mood: selectedMood, notes });
            onMoodLogged(sessionData);
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">How are you feeling right now?</h3>
            <p className="mb-6 text-slate-500 dark:text-gray-400">Logging your mood helps us tailor the perfect sounds for you.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="mb-3 block text-sm font-medium text-slate-600 dark:text-gray-300">1. Select your current mood</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {MOOD_OPTIONS.map(({ name, icon }) => (
                            <motion.button
                                type="button"
                                key={name}
                                onClick={() => setSelectedMood(name)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 border-2 ${
                                    selectedMood === name
                                        ? 'bg-violet-600/30 border-violet-500 text-white'
                                        : 'bg-slate-100 border-transparent text-slate-600 hover:border-slate-300 dark:bg-white/5 dark:text-gray-300 dark:hover:border-white/20'
                                }`}
                                whileTap={{ scale: 0.95 }}
                            >
                                {icon}
                                <span className="text-sm font-semibold capitalize">{name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-600 dark:text-gray-300">2. Add some notes (optional)</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        placeholder="What's on your mind? The more details, the better the recommendations."
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                    />
                </div>
                
                <div className="pt-2">
                    <button type="submit" disabled={isLoading || !selectedMood} className="w-full flex justify-center items-center gap-2 rounded-xl px-4 py-3 font-semibold transition bg-violet-600 hover:bg-violet-500 text-white disabled:bg-slate-700 disabled:text-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <MessageSquarePlus className="h-5 w-5" /> Get Recommendations
                            </>
                        )}
                    </button>
                    {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
                </div>
            </form>
        </div>
    );
};

export default MoodLogger;
