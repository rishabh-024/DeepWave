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
            <h3 className="text-2xl font-bold text-white mb-2">How are you feeling right now?</h3>
            <p className="text-gray-400 mb-6">Logging your mood helps us tailor the perfect sounds for you.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">1. Select your current mood</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {MOOD_OPTIONS.map(({ name, icon }) => (
                            <motion.button
                                type="button"
                                key={name}
                                onClick={() => setSelectedMood(name)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 border-2 ${
                                    selectedMood === name
                                        ? 'bg-violet-600/30 border-violet-500 text-white'
                                        : 'bg-white/5 border-transparent hover:border-white/20 text-gray-300'
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
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">2. Add some notes (optional)</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        placeholder="What's on your mind? The more details, the better the recommendations."
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
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