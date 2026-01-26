const StatCardSkeleton = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl p-5 bg-slate-800/50 border border-white/10 animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-700/50">
                    <div className="w-6 h-6 bg-slate-600/50 rounded-md"></div>
                </div>
                <div className="h-4 w-12 bg-slate-700/50 rounded-full"></div>
            </div>
            <div className="space-y-2">
                <div className="h-8 w-1/3 bg-slate-700/50 rounded-md"></div>
                <div className="h-4 w-2/3 bg-slate-700/50 rounded-full"></div>
            </div>
        </div>
    );
};

export default StatCardSkeleton;