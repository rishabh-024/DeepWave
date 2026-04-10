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
                <p className="text-lg italic text-slate-700 dark:text-gray-200">"{quote || 'A moment of calm can change your day.'}"</p>
            </div>

            {/* Recommendations Section */}
            <div>
                <h4 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Based on your mood, here are a few sounds for you:</h4>
                <div className="space-y-3">
                    {recommendations.length > 0 ? (
                        recommendations.map((track, index) => (
                            <motion.div
                                key={track._id}
                                onClick={() => onPlayTrack(track)}
                                className="group flex cursor-pointer items-center gap-4 rounded-lg bg-slate-100 p-3 transition-colors hover:bg-violet-500/10 dark:bg-white/5"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div className="h-12 w-12 grid place-items-center bg-slate-800 rounded-md flex-shrink-0 group-hover:bg-violet-600/50 transition-colors">
                                    <Music2 className="h-6 w-6 text-violet-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate font-semibold text-slate-900 dark:text-white">{track.title}</p>
                                    <p className="text-sm capitalize text-slate-500 dark:text-gray-400">{track.category}</p>
                                </div>
                                <div className="hidden text-xs text-slate-500 dark:text-gray-500 sm:block">
                                    {track.duration || '5 min'}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p className="py-4 text-center text-slate-500 dark:text-gray-400">No specific recommendations found. Feel free to explore the library.</p>
                    )}
                </div>
            </div>

            {/* End Session Button */}
            <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-white/10">
                <button
                    onClick={onEndSession}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2 font-semibold text-slate-900 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                    <RotateCcw className="h-4 w-4" /> Start Over
                </button>
            </div>
        </div>
    );
};

export default TherapySession;
