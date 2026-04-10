import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Music2, Play } from 'lucide-react';
import { sendMessage } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioContext';
import { normalizeTrack, normalizeTrackList } from '../services/trackService';

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-end gap-2 justify-start"
  >
    <div className="h-8 w-8 grid place-items-center rounded-full bg-violet-500/20 flex-shrink-0"><Bot className="h-5 w-5 text-violet-300"/></div>
    <div className="rounded-2xl rounded-bl-lg bg-white/85 px-4 py-3 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 bg-violet-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-violet-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-violet-300 rounded-full animate-bounce"></span>
      </div>
    </div>
  </motion.div>
);

const ChatMessage = ({ msg }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={`flex items-end gap-2 w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    {msg.sender === 'bot' && <div className="h-8 w-8 grid place-items-center rounded-full bg-violet-500/20 flex-shrink-0 self-start"><Bot className="h-5 w-5 text-violet-300"/></div>}
    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md ${msg.sender === 'user' ? 'rounded-br-lg bg-violet-600 text-white' : 'rounded-bl-lg bg-white/90 text-slate-900 dark:bg-slate-800 dark:text-slate-200'}`}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
    </div>
  </motion.div>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Hello! I'm your wellness companion. How are you feeling today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { playTrack } = useAudioPlayer();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend = inputText) => {
    if (textToSend.trim() === '' || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage.text);
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply,
        recommendations: response.recommendations || []
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };
  
  const handleRecommendationClick = (track, recommendations) => {
    const normalizedPlaylist = normalizeTrackList(recommendations);
    playTrack(normalizeTrack(track), normalizedPlaylist);
    setIsOpen(false);
  };

  const quickReplies = ["I'm feeling stressed", "I need to focus", "Suggest something calming"];

  if (!isAuthenticated) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 h-[70vh] max-h-[600px] z-50 flex flex-col"
          >
            <div className="relative flex-grow overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 flex flex-col">
              <header className="flex shrink-0 items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Bot className="h-6 w-6 text-violet-300" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Wellness Companion</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                  <div key={msg.id}>
                    <ChatMessage msg={msg} />
                    
                    {index === 0 && messages.length === 1 && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} className="flex flex-wrap gap-2 mt-3 ml-10">
                        {quickReplies.map(reply => (
                          <button key={reply} onClick={() => handleSend(reply)} className="rounded-full bg-violet-500/20 px-3 py-1.5 text-xs text-violet-700 transition-colors hover:bg-violet-500/40 dark:text-violet-200">
                            {reply}
                          </button>
                        ))}
                      </motion.div>
                    )}
                    
                    {msg.sender === 'bot' && msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-2 w-full max-w-[85%] self-start ml-10 space-y-2">
                        {msg.recommendations.map(track => (
                          <motion.div
                            key={track._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleRecommendationClick(track, msg.recommendations)}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white/85 p-2.5 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800/70 dark:hover:bg-slate-700/90"
                          >
                            <div className="h-10 w-10 grid place-items-center bg-violet-500/20 rounded-md shrink-0">
                              <Music2 className="h-5 w-5 text-violet-300"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{track.title}</p>
                              <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{track.category}</p>
                            </div>
                            <Play className="mr-2 h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-slate-900 dark:group-hover:text-white" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleFormSubmit} className="shrink-0 border-t border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/50">
                <div className="relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Tell me how you feel..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 pl-4 pr-12 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-400 hover:bg-violet-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || inputText.trim() === ''}>
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-4 right-4 sm:right-6 h-16 w-16 z-50 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white grid place-items-center shadow-2xl shadow-violet-800/30"
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9, rotate: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default Chatbot;
