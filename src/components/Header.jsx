import React from 'react';
import { FiMessageSquare, FiMenu, FiSettings, FiUser } from 'react-icons/fi';
import { useChatContext } from '../context/ChatContext';

const Header = ({ toggleSidebar }) => {
  const { createNewConversation } = useChatContext();
  
  return (
    <header className="bg-gray-900 text-white p-2 flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar} 
          className="p-2 mr-3 hover:bg-gray-800 rounded transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="text-xl" />
        </button>
        <div className="flex items-center">
          <div className="bg-purple-600 p-2 rounded-md mr-2">
            <FiMessageSquare className="text-white text-lg" />
          </div>
          <h1 className="text-xl font-medium">DeepSeek AI</h1>
        </div>
      </div>
      
      <div className="flex items-center">
        <button 
          onClick={createNewConversation}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md mr-2"
        >
          New Chat
        </button>
        <button className="p-2 text-gray-300 hover:bg-gray-800 rounded transition-colors duration-200">
          <FiSettings />
        </button>
        <button className="p-2 ml-1 bg-purple-600 rounded-full flex items-center justify-center">
          <FiUser className="text-white" />
        </button>
      </div>
    </header>
  );
};

export default Header; 