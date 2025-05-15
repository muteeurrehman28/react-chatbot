import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import { FiSend, FiImage, FiPaperclip, FiMic, FiChevronDown, FiX } from 'react-icons/fi';
import { useChatContext, API_PROVIDERS } from '../context/ChatContext';

const ChatWindow = ({ messages, inputValue, isLoading, onChange, onSend }) => {
  const { apiProvider, setApiProvider, availableProviders } = useChatContext();
  const [showModelList, setShowModelList] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const modelMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close the model list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setShowModelList(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleModelChange = (providerId) => {
    setApiProvider(providerId);
    setShowModelList(false);
  };

  const getProviderName = () => {
    const provider = availableProviders?.find(p => p.id === apiProvider);
    return provider ? provider.name : 'AI Model';
  };
  
  // File handling functions
  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Add file information to input
      const fileInfo = `[Attached file: ${file.name}] `;
      onChange(inputValue + fileInfo);
    }
  };
  
  // Image handling functions
  const handleImageClick = () => {
    imageInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        
        // Add image information to input
        const imageInfo = `[Attached image: ${file.name}] `;
        onChange(inputValue + imageInfo);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Voice recording functions
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Update timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
    }, 1000);
    
    // In a real app, would access the microphone API here
    // For the demo, we'll just simulate recording
    
    // Add recording indicator to input
    onChange(inputValue + "[Recording audio...] ");
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    // In a real app, would stop recording and process audio here
    // For the demo, we'll just update the input with a placeholder
    
    // Replace recording indicator with completed message
    const newInput = inputValue.replace("[Recording audio...] ", `[Audio recording complete: ${recordingTime}s] `);
    onChange(newInput);
  };
  
  // Clear attachments
  const clearAttachments = () => {
    setSelectedFile(null);
    setSelectedImage(null);
    
    // Remove attachment info from input
    const newInput = inputValue
      .replace(/\[Attached file: .*?\] /g, '')
      .replace(/\[Attached image: .*?\] /g, '')
      .replace(/\[Audio recording complete: .*?s\] /g, '');
    
    onChange(newInput);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-xl shadow-2xl mb-8 transform transition-transform duration-500 hover:scale-105">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white animated-gradient-text">Welcome to {getProviderName()}</h2>
            <p className="text-gray-300 text-center max-w-2xl text-lg mb-6">
              Your advanced AI assistant powered by state-of-the-art language models.
            </p>
            
            <div className="max-w-2xl w-full">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="glass-effect rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-500/50">
                  <h3 className="text-lg font-semibold text-white mb-2">How can I help you?</h3>
                  <p className="text-gray-400 text-sm">Ask me anything from simple questions to complex tasks.</p>
                </div>
                <div className="glass-effect rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-500/50">
                  <h3 className="text-lg font-semibold text-white mb-2">Capabilities</h3>
                  <p className="text-gray-400 text-sm">I can write code, explain concepts, summarize information, and more.</p>
                </div>
              </div>
              
              <p className="text-gray-400 mb-4 font-medium">Try asking questions like:</p>
              <div className="space-y-3">
                <button 
                  className="w-full p-4 border border-gray-700 rounded-xl hover:bg-gray-800 text-left transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md"
                  onClick={() => onChange("What is artificial intelligence?")}
                >
                  <span className="text-indigo-400 font-medium">"What is artificial intelligence?"</span>
                </button>
                <button 
                  className="w-full p-4 border border-gray-700 rounded-xl hover:bg-gray-800 text-left transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md"
                  onClick={() => onChange("Write a function to calculate Fibonacci numbers in JavaScript")}
                >
                  <span className="text-indigo-400 font-medium">"Write a function to calculate Fibonacci numbers in JavaScript"</span>
                </button>
                <button 
                  className="w-full p-4 border border-gray-700 rounded-xl hover:bg-gray-800 text-left transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md"
                  onClick={() => onChange("Can you explain how React hooks work?")}
                >
                  <span className="text-indigo-400 font-medium">"Can you explain how React hooks work?"</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-4 max-w-4xl mx-auto w-full">
            {messages.map((msg, index) => (
              <Message 
                key={index} 
                message={msg.content} 
                isBot={msg.role === 'assistant'} 
                metadata={msg.metadata}
              />
            ))}
            {isLoading && (
              <div className="p-5 my-2 mx-4 md:mx-8 bg-gray-800/70 rounded-xl backdrop-blur-sm flex items-center border border-gray-700 shadow-lg">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1 text-white">{getProviderName()}</div>
                  <div className="text-gray-300">Thinking<span className="animate-ellipsis">...</span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area with attachments */}
      <div className="border-t border-gray-700 bg-gray-900 py-4">
        <div className="max-w-4xl mx-auto px-4">
          {/* Show previews of attachments if any */}
          {(selectedFile || selectedImage) && (
            <div className="mb-2 p-2 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                {selectedImage && (
                  <div className="h-10 w-10 mr-2 rounded border border-gray-600 overflow-hidden">
                    <img src={selectedImage} alt="Selected preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="text-sm text-gray-300">
                  {selectedFile && <div>File: {selectedFile.name}</div>}
                  {selectedImage && !selectedFile && <div>Image ready to send</div>}
                </div>
              </div>
              <button 
                onClick={clearAttachments}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <FiX className="text-gray-400" />
              </button>
            </div>
          )}
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="mb-2 p-2 bg-red-900/50 rounded-lg border border-red-700 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                <div className="text-sm text-red-300">Recording: {recordingTime}s</div>
              </div>
              <button 
                onClick={stopRecording}
                className="p-1 hover:bg-red-800 rounded-full"
              >
                <FiX className="text-red-300" />
              </button>
            </div>
          )}
          
          <div className="relative rounded-lg bg-gray-800 border border-gray-700">
            <textarea
              value={inputValue}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full bg-transparent p-3 pr-24 text-white resize-none outline-none"
              rows={1}
              disabled={isLoading}
              style={{ maxHeight: '200px', minHeight: '56px' }}
            />
            
            <div className="absolute right-2 bottom-2.5 flex items-center space-x-1">
              {/* Hidden file inputs */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={imageInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              <button 
                className={`text-gray-400 hover:text-gray-200 p-1.5 ${selectedFile ? 'text-blue-400' : ''}`}
                onClick={handleFileClick}
              >
                <FiPaperclip size={18} />
              </button>
              <button 
                className={`text-gray-400 hover:text-gray-200 p-1.5 ${selectedImage ? 'text-blue-400' : ''}`}
                onClick={handleImageClick}
              >
                <FiImage size={18} />
              </button>
              <button 
                className={`text-gray-400 hover:text-gray-200 p-1.5 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                onClick={handleMicClick}
              >
                <FiMic size={18} />
              </button>
              <button
                onClick={onSend}
                disabled={!inputValue.trim() || isLoading}
                className={`p-1.5 rounded ${
                  !inputValue.trim() || isLoading
                   ? 'text-gray-500 cursor-not-allowed'
                   : 'text-blue-400 hover:text-blue-300'
                }`}
                aria-label="Send message"
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>AI can make mistakes. Consider checking important information.</span>
            </div>
            <div className="relative" ref={modelMenuRef}>
              <button 
                className="flex items-center hover:text-gray-200" 
                onClick={() => setShowModelList(!showModelList)}
              >
                <span className="mr-1">Model: {getProviderName()}</span>
                <FiChevronDown className={`ml-1 transition-transform ${showModelList ? 'rotate-180' : ''}`} />
              </button>
              
              {showModelList && (
                <div className="absolute bottom-full right-0 mb-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden z-10">
                  {availableProviders.map(provider => (
                    <button
                      key={provider.id}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${apiProvider === provider.id ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
                      onClick={() => handleModelChange(provider.id)}
                    >
                      {provider.name}
                      {apiProvider === provider.id && (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 