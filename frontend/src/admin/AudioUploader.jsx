import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Music, X, ImagePlus, CheckCircle, AlertTriangle, LoaderCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api'

const CATEGORIES = [
    { value: 'nature', label: 'Nature' },
    { value: 'ambient-music', label: 'Ambient Music' },
    { value: 'binaural-beats', label: 'Binaural Beats' },
    { value: 'white_noise', label: 'White Noise' },
    { value: 'relaxation', label: 'Relaxation' },
];

const AudioUploader = ({ onUploadSuccess }) => {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0].value);
    const [tags, setTags] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const coverInputRef = useRef(null);

    useEffect(() => {
        return () => {
                if (coverPreview) URL.revokeObjectURL(coverPreview);
            };
    }, [coverPreview]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            setSelectedFile(file);
            setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '));
            setError('');
        } else {
            setSelectedFile(null);
            setError('Please select a valid audio file (mp3 / wav / ogg).');
        }
    };

    const handleCoverChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
        const MAX_COVER_SIZE = 4 * 1024 * 1024;
        if (!allowedImageTypes.includes(file.type)) {
            setError('Cover must be a PNG, JPEG, or WEBP.'); return;
        }
        if (file.size > MAX_COVER_SIZE) {
            setError('Cover image is too large (Max 4 MB).'); return;
        }
        setCoverFile(file);
        setError('');
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview(URL.createObjectURL(file));
    };

    const removeCover = () => {
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
        setCoverFile(null);
        if (coverInputRef.current) coverInputRef.current.value = "";
    };

    const resetForm = () => {
        setSelectedFile(null);
        setCoverFile(null);
        setCoverPreview(null);
        if (coverInputRef.current) coverInputRef.current.value = "";
        setTitle('');
        setCategory(CATEGORIES[0].value);
        setTags('');
        setError('');
        setSuccess('');
        setUploadProgress(0);
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('No audio file selected.');
            return;
        };

        setIsLoading(true);
        setError('');
        setSuccess('');
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('audio', selectedFile);
        if (coverFile) {
            formData.append('cover', coverFile);
        }
        formData.append('title', title);
        formData.append('category', category);
        formData.append('tags', tags);

        try {
            const response = await api.post('/sounds', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });

            setSuccess('Upload successful! Track created.');
            setIsLoading(false);
            setTimeout(() => {
                resetForm();
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            }, 1500);

        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.error?.message || 'Upload failed. Please try again.');
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 dark:shadow-2xl sm:p-8"
        >
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Upload New Soundscape</h2>
            
            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <label htmlFor="audio-upload" className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-slate-800/50 hover:border-violet-400 hover:bg-slate-800 transition-all duration-300">
                             <div className="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col items-center justify-center">
                                <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-violet-300 transition-colors" />
                                <p className="mb-2 text-sm text-gray-300"><span className="font-semibold">Click to upload</span> or drag and drop audio</p>
                                <p className="text-xs text-gray-500">MP3, WAV, or OGG</p>
                            </div>
                            <input id="audio-upload" type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
                        </label>
                    </motion.div>
                ) : (
                    <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label htmlFor="cover-upload" className="block text-sm font-medium text-gray-300 mb-2">Cover Art</label>
                                <div className="relative aspect-square w-full rounded-xl border-2 border-dashed border-white/20 bg-slate-800/50 flex items-center justify-center group cursor-pointer hover:border-violet-400 transition-colors overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                                    {coverPreview ? (
                                        <>
                                            <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                                            <button type="button" onClick={removeCover} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm transition-colors" title="Remove cover">
                                                <X className="h-4 w-4 text-white" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-sm font-semibold">Add Cover</p>
                                            <p className="text-xs">(Optional)</p>
                                        </div>
                                    )}
                                    <input id="cover-upload" ref={coverInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleCoverChange} />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-slate-800/70">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Music className="h-6 w-6 text-violet-400 flex-shrink-0" />
                                        <p className="truncate font-medium text-slate-900 dark:text-white">{selectedFile.name}</p>
                                    </div>
                                    <button type="button" onClick={() => setSelectedFile(null)} className="p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white" title="Change audio file">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div>
                                    <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-600 dark:text-gray-300">Title</label>
                                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-white/20 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-600 dark:text-gray-300">Category</label>
                                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-white/20 dark:bg-slate-800 dark:text-white">
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="tags" className="mb-1 block text-sm font-medium text-slate-600 dark:text-gray-300">Tags (comma-separated)</label>
                                        <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. calm, focus" className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-white/20 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400" />
                                    </div>
                                </div>
                                
                                {isLoading && (
                                    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                        <motion.div className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ ease: "linear" }} />
                                    </div>
                                )}
                                <div className="h-6 text-center">
                                    {error && <p className="flex items-center justify-center gap-2 text-red-400 text-sm"><AlertTriangle className="h-4 w-4"/>{error}</p>}
                                    {success && <p className="flex items-center justify-center gap-2 text-green-400 text-sm"><CheckCircle className="h-4 w-4"/>{success}</p>}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button type="submit" disabled={isLoading || !selectedFile} className="inline-flex items-center justify-center gap-2 flex-1 rounded-xl px-4 py-3 font-semibold transition bg-violet-600 hover:bg-violet-500 text-white disabled:bg-slate-700 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        {isLoading ? <><LoaderCircle className="h-5 w-5 animate-spin" /> {`Uploading ${uploadProgress}%`}</> : 'Create Track'}
                                    </button>
                                    <button type="button" onClick={resetForm} disabled={isLoading} className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold transition bg-white/5 hover:bg-white/10 text-white disabled:opacity-50">
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AudioUploader;
