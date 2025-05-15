import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { ChatProvider, useChatContext } from './context/ChatContext';
import './App.css';

const ChatInterface = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { 
    conversations, 
    activeConversation, 
    inputValue, 
    isLoading, 
    error, 
    messages,
    setInputValue, 
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    apiProvider,
    setApiProvider,
    availableProviders
  } = useChatContext();

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const clearError = () => {
    // Use the global instance to clear errors
    if (window.useChatContextInstance) {
      window.useChatContextInstance.setError(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <div className={`transition-all duration-300 ease-in-out ${sidebarVisible ? 'w-64' : 'w-0'}`}>
        {sidebarVisible && (
          <Sidebar 
            conversations={conversations}
            activeConversation={activeConversation}
            onSelect={selectConversation}
            onNew={createNewConversation}
            onDelete={deleteConversation}
          />
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            messages={messages}
            inputValue={inputValue}
            isLoading={isLoading}
            onChange={setInputValue}
            onSend={sendMessage}
          />
        </div>
        
        {error && (
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 max-w-lg w-full px-4 py-3 bg-red-600 bg-opacity-90 text-white rounded-lg shadow-lg backdrop-blur-sm border border-red-400 text-center animation-fade-in">
            <div className="font-medium">
              {error}
            </div>
            <button 
              className="absolute top-2 right-2 text-white hover:text-gray-200 p-1"
              onClick={clearError}
              aria-label="Close error message"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
}

export default App;
