import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = React.memo(({ icon: Icon, label, value, trend, color = "purple" }) => {
    const colorVariants = {
        purple: "from-purple-600/20 to-slate-900/10 border-purple-400/20",
        blue: "from-blue-600/20 to-slate-900/10 border-blue-400/20",
        green: "from-green-600/20 to-slate-900/10 border-green-400/20",
        orange: "from-orange-600/20 to-slate-900/10 border-orange-400/20",
    };

    const isPositiveTrend = trend && trend.startsWith('+');

    return (
        <motion.div
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${colorVariants[color]} border backdrop-blur-md hover:border-white/20 transition-all duration-300 group cursor-pointer`}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                    {Icon && <Icon className="w-6 h-6 text-white" />}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${isPositiveTrend ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositiveTrend ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-bold text-white">{value}</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wider">{label}</div>
            </div>
            {/* A subtle decorative element */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500 ease-out" />
        </motion.div>
    );
});

export default StatCard;