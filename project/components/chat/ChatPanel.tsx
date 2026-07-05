'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrafficStore } from '@/store/trafficStore';
import { sendChatMessage } from '@/lib/ai-service';

function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && message.agent && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-xs">AI</span>
            </div>
            <span className="text-xs text-cyan-400">{message.agent}</span>
          </div>
        )}
        <div className={`rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-cyan-500 text-white'
            : 'glass-light text-gray-200'
        }`}>

          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

const quickActions = [
  { label: 'Traffic Status', query: 'What is the current traffic status?' },
  { label: 'Find Route', query: 'Find the fastest route downtown.' },
  { label: 'Predict', query: 'Predict traffic in 30 minutes.' },
  { label: 'Incidents', query: 'Show me all active incidents.' },
  { label: 'Parking', query: 'Where can I park near downtown?' },
  { label: 'Weather', query: 'How will weather affect traffic?' },
];

export function ChatPanel() {
  const { chatMessages, addChatMessage, isAIThinking, setAIThinking, selectObject, setCameraTarget } = useTrafficStore();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isAIThinking) return;

    const userMessage = input.trim();
    setInput('');

    addChatMessage({ role: 'user', content: userMessage });
    setAIThinking(true);

    try {
      const response = await sendChatMessage(userMessage, {
        currentStats: useTrafficStore.getState().stats,
        weather: useTrafficStore.getState().weather,
      });

      addChatMessage({
        role: 'assistant',
        content: response.text,
        agent: 'Traffic AI',
      });

      if (response.action) {
        switch (response.action.type) {
          case 'highlight_road':
            const road = useTrafficStore.getState().roads.find(r => r.id === response.action?.data?.roadId);
            if (road) selectObject(road, 'road');
            break;
          case 'center_camera':
            setCameraTarget(response.action.data);
            break;
        }
      }
    } catch (error) {
      addChatMessage({
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        agent: 'Traffic AI',
      });
    } finally {
      setAIThinking(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 glass rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Traffic Assistant</h3>
                  <p className="text-xs text-gray-400">
                    {isAIThinking ? 'Thinking...' : 'Online'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
            </div>

            <div className="h-80 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <h4 className="text-sm font-medium text-white mb-2">Hello! I'm your Traffic AI</h4>
                  <p className="text-xs text-gray-400 mb-4">
                    Ask me about traffic, routes, incidents, or predictions.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.slice(0, 4).map((action) => (
                      <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAction(action.query)}
                        className="px-3 py-2 glass-light rounded-lg text-xs text-gray-300 hover:text-white transition-colors text-left"
                      >
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isAIThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass-light rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-2 h-2 rounded-full bg-cyan-400"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-cyan-400"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-cyan-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about traffic..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  disabled={isAIThinking}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isAIThinking}
                  className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg glow-cyan"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
