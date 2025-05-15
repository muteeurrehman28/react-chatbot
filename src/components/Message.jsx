import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiUser, FiCpu, FiCopy, FiThumbsUp, FiThumbsDown, FiCheckCircle, FiFile, FiImage, FiMic } from 'react-icons/fi';
import { useChatContext } from '../context/ChatContext';

const Message = ({ message, isBot, metadata }) => {
  const [copied, setCopied] = useState(false);
  const { apiProvider, availableProviders } = useChatContext();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const getModelName = () => {
    if (!isBot) return 'You';
    
    const provider = availableProviders?.find(p => p.id === apiProvider);
    return provider ? provider.name : 'AI Assistant';
  };
  
  // Check if message has attachments
  const hasAttachments = metadata && metadata.attachments && metadata.attachments.length > 0;

  return (
    <div className={`my-4 mx-4 md:mx-8 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
      isBot 
        ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700'
        : 'bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600'
    }`}>
      <div className="flex p-5">
        <div className="flex-shrink-0 mr-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
            isBot 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}>
            {isBot ? <FiCpu className="text-white" /> : <FiUser className="text-white" />}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <div className="font-medium text-white">{getModelName()}</div>
            {isBot && (
              <div className="ml-2 px-2 py-0.5 bg-indigo-900/50 rounded-full text-xs text-indigo-300 border border-indigo-800/50">
                AI Assistant
              </div>
            )}
          </div>
          
          {/* Display attachments if any */}
          {hasAttachments && (
            <div className="mb-3 flex flex-wrap gap-2">
              {metadata.attachments.map((attachment, index) => (
                <div 
                  key={index}
                  className="flex items-center px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-600 text-sm"
                >
                  {attachment.type === 'file' && (
                    <>
                      <FiFile className="text-blue-400 mr-2" />
                      <span className="text-gray-300">{attachment.name}</span>
                    </>
                  )}
                  {attachment.type === 'image' && (
                    <>
                      <FiImage className="text-green-400 mr-2" />
                      <span className="text-gray-300">{attachment.name}</span>
                    </>
                  )}
                  {attachment.type === 'audio' && (
                    <>
                      <FiMic className="text-red-400 mr-2" />
                      <span className="text-gray-300">Audio ({attachment.duration})</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="text-gray-200 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  
                  if (!inline && match) {
                    const code = String(children).replace(/\n$/, '');
                    return (
                      <div className="relative group my-4">
                        <div className="absolute right-2 top-2 z-10">
                          <button 
                            onClick={() => copyToClipboard(code)}
                            className="p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 text-gray-300 transition-colors duration-200"
                            aria-label="Copy code"
                          >
                            {copied ? <FiCheckCircle className="text-green-400" size={14} /> : <FiCopy size={14} />}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                          customStyle={{
                            borderRadius: '0.5rem', 
                            padding: '1rem', 
                            marginTop: '0.5rem', 
                            marginBottom: '0.5rem',
                            background: 'rgba(31, 41, 55, 0.5)'
                          }}
                          wrapLongLines={true}
                          {...props}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    );
                  } else {
                    return (
                      <code className={`bg-gray-900 px-1.5 py-0.5 rounded text-indigo-300 ${className}`} {...props}>
                        {children}
                      </code>
                    );
                  }
                },
                
                p({children}) {
                  return <p className="mb-4 last:mb-0">{children}</p>;
                },
                
                ul({children}) {
                  return <ul className="list-disc pl-6 mb-4 last:mb-0">{children}</ul>;
                },
                
                ol({children}) {
                  return <ol className="list-decimal pl-6 mb-4 last:mb-0">{children}</ol>;
                },
                
                li({children}) {
                  return <li className="mb-1">{children}</li>;
                },
                
                h1({children}) {
                  return <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>;
                },
                
                h2({children}) {
                  return <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>;
                },
                
                h3({children}) {
                  return <h3 className="text-lg font-bold mb-3 text-white">{children}</h3>;
                },
                
                blockquote({children}) {
                  return <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-300 mb-4">{children}</blockquote>;
                }
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      {isBot && (
        <div className="flex justify-between items-center px-5 py-3 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-400">
            Powered by {getModelName()}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors duration-200 text-gray-400 hover:text-gray-300">
              <FiThumbsUp size={14} />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors duration-200 text-gray-400 hover:text-gray-300">
              <FiThumbsDown size={14} />
            </button>
            <button 
              onClick={() => copyToClipboard(message)}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors duration-200 text-gray-400 hover:text-gray-300"
            >
              {copied ? <FiCheckCircle className="text-green-400" size={14} /> : <FiCopy size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message; 