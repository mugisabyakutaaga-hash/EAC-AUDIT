
import React, { useState, useRef, useEffect } from 'react';
import { TRANSLATIONS, ICONS } from '../constants';
import { Language, ChatMessage, EACCountry } from '../types';
import { chatWithGemini } from '../services/geminiService';

interface ChatBotProps {
  language: Language;
  country: EACCountry;
  isFloating?: boolean;
  onClose?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ language, country, isFloating, onClose }) => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithGemini(input, history, country, useThinking);
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response || 'Sorry, I encountered an error.', 
        timestamp: Date.now(),
        isThinking: useThinking
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to mugisolo. Please check your connectivity.', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const containerClasses = isFloating 
    ? "flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300" 
    : "flex flex-col h-[calc(100vh-250px)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden";

  return (
    <div className={containerClasses}>
      <div className="bg-slate-900 text-white p-5 flex justify-between items-center relative overflow-hidden">
        {/* Abstract background effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-600/20 blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center space-x-3 z-10">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/40">
            <ICONS.Chat />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">mugisolo <span className="text-green-500">AI</span></h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Regional Advisory Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 z-10">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${useThinking ? 'bg-green-600' : 'bg-slate-700'}`}>
               <input 
                type="checkbox" 
                className="hidden"
                checked={useThinking}
                onChange={() => setUseThinking(!useThinking)}
              />
              <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${useThinking ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white transition-colors">{t.thinkingMode}</span>
          </label>
          {isFloating && onClose && (
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner text-slate-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <h4 className="font-black text-slate-800 uppercase tracking-tight mb-2">I am mugisolo</h4>
            <p className="max-w-xs text-xs font-medium leading-relaxed">{t.askAnything}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
               {['Tax rules in ' + country, 'VAT XML format', 'Substantive testing'].map(q => (
                 <button 
                  key={q} 
                  onClick={() => setInput(q)}
                  className="bg-white border border-slate-200 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight text-slate-500 hover:border-green-600 hover:text-green-600 transition shadow-sm"
                 >
                   {q}
                 </button>
               ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
              m.role === 'user' 
                ? 'bg-slate-900 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              {m.isThinking && (
                <div className="text-[9px] uppercase font-black text-blue-500 mb-2 flex items-center tracking-widest">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  Mugisolo Deep Reasoning
                </div>
              )}
              <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-bl-none shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mugisolo is thinking</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your EAC compliance question..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 text-sm font-medium focus:ring-4 focus:ring-green-500/10 focus:bg-white outline-none transition"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bg-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-green-500 disabled:opacity-50 transition shadow-lg shadow-green-900/20 active:scale-90"
          >
            <ICONS.Send />
          </button>
        </div>
        <p className="mt-3 text-[8px] text-center font-bold text-slate-400 uppercase tracking-tighter">
          Powered by Mugisolo AI • Verified for {country} Regulation 2025
        </p>
      </div>
    </div>
  );
};

export default ChatBot;
