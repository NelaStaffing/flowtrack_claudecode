import React, { useState, useRef, useEffect } from 'react';

function Message({ role, content, timestamp }) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          isUser
            ? 'bg-purple-600 text-white'
            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
        }`}
      >
        {isUser ? 'U' : '🤖'}
      </div>
      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`inline-block px-4 py-2.5 rounded-2xl max-w-[85%] ${
            isUser
              ? 'bg-purple-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
        {timestamp && (
          <p className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}

function SuggestedAction({ icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all"
    >
      <span>{icon}</span>
      <span>{text}</span>
    </button>
  );
}

export default function CopilotPanel({ isOpen, onClose, currentContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm your FlowTrack AI assistant. I can help you with:\n\n• Creating and organizing tasks\n• Identifying blockers\n• Generating project reports\n• Suggesting optimizations\n\nWhat would you like help with?",
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: generateResponse(inputValue, currentContext),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (query, context) => {
    // Placeholder AI logic - replace with actual AI integration
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('task') || lowerQuery.includes('create')) {
      return `I can help you create a task! Based on your current context, I suggest:\n\n1. Break it down into smaller subtasks\n2. Assign it to a team member\n3. Set a realistic deadline\n4. Add relevant tags for tracking\n\nWould you like me to create a task template for you?`;
    }

    if (lowerQuery.includes('blocker') || lowerQuery.includes('stuck')) {
      return `I've analyzed your projects and found:\n\n🔴 2 high-priority blockers\n🟡 3 medium-priority items\n\nThe most critical blocker is in Project Alpha regarding API dependencies. Would you like me to suggest mitigation steps?`;
    }

    if (lowerQuery.includes('report') || lowerQuery.includes('summary')) {
      return `I can generate several types of reports:\n\n📊 Project Health Summary\n📈 Team Velocity Report\n⏱️ Time Tracking Analysis\n🎯 Milestone Progress\n\nWhich would you like me to create?`;
    }

    return `I understand you're asking about "${query}". Based on your current workspace, I recommend checking:\n\n• Recent activity in your active projects\n• Pending tasks assigned to you\n• Any open blockers\n\nIs there something specific I can help you with?`;
  };

  const suggestedActions = [
    { icon: '📝', text: 'Create task from selection', action: () => {} },
    { icon: '📊', text: 'Generate project report', action: () => {} },
    { icon: '🎯', text: 'Review my tasks', action: () => {} },
    { icon: '⚠', text: 'Check blockers', action: () => {} },
  ];

  if (!isOpen) return null;

  return (
    <aside className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm">
            🤖
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Copilot</h2>
            <p className="text-xs text-gray-500">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          ✕
        </button>
      </div>

      {/* Context Bar */}
      {currentContext && (
        <div className="px-4 py-2 bg-purple-50 border-b border-purple-100">
          <p className="text-xs text-purple-700">
            <span className="font-semibold">Context:</span> {currentContext}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm">
              🤖
            </div>
            <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions */}
      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestedActions.map((action, index) => (
            <SuggestedAction
              key={index}
              icon={action.icon}
              text={action.text}
              onClick={action.action}
            />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-lg">→</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          AI responses are suggestions. Always verify important decisions.
        </p>
      </div>
    </aside>
  );
}
