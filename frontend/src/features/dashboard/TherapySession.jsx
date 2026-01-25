import { motion } from 'framer-motion';
import { Quote, Music2, RotateCcw } from 'lucide-react';

const TherapySession = ({ sessionData, onEndSession, onPlayTrack }) => {
    if (!sessionData) return null;

    const { quote, recommendations = [] } = sessionData;

    return (
        <div className="w-full">
            {/* Motivational Quote Section */}
            <div className="text-center mb-8">
                <Quote className="h-10 w-10 text-violet-400 mx-auto mb-4 fill-violet-400/10" />
                <p className="text-lg italic text-gray-200">"{quote || 'A moment of calm can change your day.'}"</p>
            </div>

            {/* Recommendations Section */}
            <div>
                <h4 className="text-lg font-bold text-white mb-4">Based on your mood, here are a few sounds for you:</h4>
                <div className="space-y-3">
                    {recommendations.length > 0 ? (
                        recommendations.map((track, index) => (
                            <motion.div
                                key={track._id}
                                onClick={() => onPlayTrack(track)}
                                className="p-3 rounded-lg bg-white/5 flex items-center gap-4 hover:bg-violet-500/10 transition-colors cursor-pointer group"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="h-12 w-12 grid place-items-center bg-slate-800 rounded-md flex-shrink-0 group-hover:bg-violet-600/50 transition-colors">
                                    <Music2 className="h-6 w-6 text-violet-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{track.title}</p>
                                    <p className="text-sm text-gray-400 capitalize">{track.category}</p>
                                </div>
                                <div className="text-xs text-gray-500 hidden sm:block">
                                    {track.duration || '5 min'}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4">No specific recommendations found. Feel free to explore the library.</p>
                    )}
                </div>
            </div>

            {/* End Session Button */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <button
                    onClick={onEndSession}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <RotateCcw className="h-4 w-4" /> Start Over
                </button>
            </div>
        </div>
    );
};

export default TherapySession;