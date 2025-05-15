import React, { createContext, useContext, useState, useCallback } from 'react';
import useChat from '../hooks/useChat';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

// API provider options
export const API_PROVIDERS = [
  { id: 'simulate', name: 'Simulation' },
  { id: 'huggingface', name: 'Hugging Face' },
  { id: 'nlpcloud', name: 'NLP Cloud' }
];

export const ChatProvider = ({ children }) => {
  const [apiProvider, setApiProvider] = useState('simulate');
  const chatState = useChat(apiProvider);
  
  const contextValue = {
    ...chatState,
    apiProvider,
    setApiProvider,
    availableProviders: API_PROVIDERS
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext; 