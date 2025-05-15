import { useState, useCallback, useEffect } from 'react';
import { fetchChatResponse } from '../utils/api';

const useChat = (apiProvider = 'huggingface') => {
  const [conversations, setConversations] = useState([
    { id: '1', title: 'Welcome Conversation', messages: [] }
  ]);
  const [activeConversation, setActiveConversation] = useState('1');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Store a reference to this instance for external access (like from the App component)
  useEffect(() => {
    window.useChatContextInstance = {
      setError
    };
    return () => {
      // Clean up when unmounted
      window.useChatContextInstance = null;
    };
  }, []);

  // Clear error after 7 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getActiveMessages = useCallback(() => {
    const conversation = conversations.find(conv => conv.id === activeConversation);
    return conversation ? conversation.messages : [];
  }, [conversations, activeConversation]);

  const addMessage = useCallback((role, content, metadata = {}) => {
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === activeConversation) {
          // If this is the first user message, update the conversation title
          const newTitle = conv.title === 'Welcome Conversation' && role === 'user' 
            ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
            : conv.title;
          
          return {
            ...conv,
            title: newTitle,
            messages: [...conv.messages, { role, content, metadata }]
          };
        }
        return conv;
      });
    });
  }, [activeConversation]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Check for attachments in the message
    const hasFile = userMessage.includes('[Attached file:');
    const hasImage = userMessage.includes('[Attached image:');
    const hasAudio = userMessage.includes('[Audio recording complete:');
    
    // Add metadata for attachments if present
    let messageContent = userMessage;
    let metadata = {};
    
    if (hasFile || hasImage || hasAudio) {
      metadata.attachments = [];
      
      if (hasFile) {
        const fileMatch = userMessage.match(/\[Attached file: (.*?)\]/);
        if (fileMatch && fileMatch[1]) {
          metadata.attachments.push({ type: 'file', name: fileMatch[1] });
          // Clean up the message text for display
          messageContent = messageContent.replace(/\[Attached file: .*?\] ?/g, '');
        }
      }
      
      if (hasImage) {
        const imageMatch = userMessage.match(/\[Attached image: (.*?)\]/);
        if (imageMatch && imageMatch[1]) {
          metadata.attachments.push({ type: 'image', name: imageMatch[1] });
          // Clean up the message text for display
          messageContent = messageContent.replace(/\[Attached image: .*?\] ?/g, '');
        }
      }
      
      if (hasAudio) {
        const audioMatch = userMessage.match(/\[Audio recording complete: (.*?)s\]/);
        if (audioMatch && audioMatch[1]) {
          metadata.attachments.push({ type: 'audio', duration: audioMatch[1] + 's' });
          // Clean up the message text for display
          messageContent = messageContent.replace(/\[Audio recording complete: .*?s\] ?/g, '');
        }
      }
      
      // If no text content after removing attachments, add a generic message
      if (!messageContent.trim()) {
        messageContent = 'Please analyze the attached content.';
      }
    }
    
    // Add message with cleaned content and attachment metadata
    addMessage('user', messageContent, metadata);
    setIsLoading(true);
    setError(null);
    
    try {
      const messages = [...getActiveMessages(), { 
        role: 'user', 
        content: messageContent,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined
      }];
      
      // Include information about attachments in the message to AI
      let promptWithAttachments = messageContent;
      if (Object.keys(metadata).length > 0 && metadata.attachments) {
        const attachmentDescriptions = metadata.attachments.map(att => {
          if (att.type === 'file') return `[User has attached a file: ${att.name}]`;
          if (att.type === 'image') return `[User has attached an image: ${att.name}]`;
          if (att.type === 'audio') return `[User has attached an audio recording: ${att.duration}]`;
          return '';
        }).join(' ');
        
        promptWithAttachments = `${attachmentDescriptions} ${messageContent}`.trim();
      }
      
      const response = await fetchChatResponse(messages, apiProvider, promptWithAttachments);
      
      // Only show the API connection failed message when using Hugging Face
      // and the response comes from the fallback mechanism
      if (apiProvider === 'huggingface' && 
          (response.startsWith('I understand your question about') || 
           response.includes('I\'m just a simulated AI response'))) {
        setError('Using simulated responses because the API connection failed. Please check console for details.');
      }
      
      addMessage('assistant', response);
    } catch (err) {
      console.error('Error fetching response:', err);
      
      // Provide more specific error messages based on the error
      if (err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.response && err.response.status === 429) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else if (err.response && err.response.status === 403) {
        setError('API key error. Please check your API key in the configuration.');
      } else if (err.message.includes('Unexpected API response')) {
        setError('Received an unexpected response format from the API.');
      } else {
        setError('Failed to get response. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, addMessage, getActiveMessages, apiProvider]);

  const createNewConversation = useCallback(() => {
    const newId = Date.now().toString();
    setConversations(prev => [
      ...prev,
      { id: newId, title: 'New Conversation', messages: [] }
    ]);
    setActiveConversation(newId);
    setInputValue('');
    setError(null);
  }, []);

  const selectConversation = useCallback((id) => {
    setActiveConversation(id);
    setInputValue('');
    setError(null);
  }, []);

  const deleteConversation = useCallback((id) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    // If the active conversation is deleted, select another one
    if (activeConversation === id && conversations.length > 1) {
      const remainingConvs = conversations.filter(conv => conv.id !== id);
      setActiveConversation(remainingConvs[0]?.id || '');
    }
  }, [activeConversation, conversations]);

  return {
    conversations,
    activeConversation,
    inputValue,
    isLoading,
    error,
    messages: getActiveMessages(),
    setInputValue,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    setError
  };
};

export default useChat; 