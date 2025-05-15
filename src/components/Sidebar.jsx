import React from 'react';
import { FiPlus, FiMessageSquare, FiTrash, FiFolder, FiStar } from 'react-icons/fi';

const Sidebar = ({ conversations, activeConversation, onSelect, onNew, onDelete }) => {
  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl">
      <div className="p-4">
        <button 
          onClick={onNew}
          className="flex items-center justify-center w-full py-2 px-4 rounded-md border border-gray-600 hover:border-indigo-500 hover:bg-gray-700 transition-all duration-200 bg-gray-800"
        >
          <FiPlus className="mr-2 text-indigo-400" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>
      
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">Recent conversations</span>
        <button className="p-1 hover:bg-gray-700 rounded transition-colors duration-200">
          <FiFolder className="text-gray-400 text-sm" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 no-scrollbar">
        <ul className="space-y-1">
          {conversations.map((conversation) => (
            <li 
              key={conversation.id}
              className={`rounded-md transition-all duration-200 ${
                activeConversation === conversation.id 
                ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-2 border-indigo-500 shadow-md' 
                : 'hover:bg-gray-800/70'
              }`}
            >
              <div 
                className="px-3 py-3 flex items-center justify-between cursor-pointer"
                onClick={() => onSelect(conversation.id)}
              >
                <div className="flex items-center overflow-hidden">
                  <div className={`text-lg mr-3 ${activeConversation === conversation.id ? 'text-indigo-400' : 'text-gray-400'}`}>
                    <FiMessageSquare />
                  </div>
                  <div className="truncate">
                    <span className={`truncate text-sm ${activeConversation === conversation.id ? 'text-white font-medium' : 'text-gray-300'}`}>
                      {conversation.title || 'New Conversation'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <button 
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-indigo-400 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Favorite feature (could be implemented later)
                    }}
                  >
                    <FiStar className="text-gray-400 hover:text-yellow-400" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conversation.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <FiTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-700 mt-auto">
        <div className="flex items-center text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span>Connected to DeepSeek AI</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 