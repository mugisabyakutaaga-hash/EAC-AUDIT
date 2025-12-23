
import React, { useState, useRef, useEffect } from 'react';
import { TRANSLATIONS, ICONS } from '../constants';
import { Language, ChatMessage, EACCountry } from '../types';
import { chatWithGemini } from '../services/geminiService';

interface ChatBotProps {
  language: Language;
  country: EACCountry;
}

const ChatBot: React.FC<ChatBotProps> = ({ language, country }) => {
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
      
      // Fixed: Added country as the 3rd argument to chatWithGemini
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ICONS.Chat />
          <h3 className="font-bold">{t.aiChat}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs flex items-center space-x-1 cursor-pointer">
            <input 
              type="checkbox" 
              checked={useThinking} 
              onChange={() => setUseThinking(!useThinking)}
              className="rounded text-green-600 focus:ring-green-500"
            />
            <span className="font-medium text-slate-300">{t.thinkingMode}</span>
          </label>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <ICONS.Chat />
            </div>
            <p className="max-w-xs">{t.askAnything}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              m.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              {m.isThinking && (
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1 animate-pulse"></div>
                  Generated with Deep Reasoning
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.askAnything}
            className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
          >
            <ICONS.Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
