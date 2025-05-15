import axios from 'axios';

// API Configuration
// Hugging Face API settings
const HF_API_KEY = ''; // Add your API key here
// Changed to a simple, reliable text generation model
const HF_API_URL = 'https://api-inference.huggingface.co/models/gpt2';

// NLP Cloud API settings (optional alternative)
const NLP_API_KEY = ''; // Add your NLP Cloud API key here
const NLP_API_URL = 'https://api.nlpcloud.io/v1/gpu/chatgpt/chat';

// Whether to fall back to simulated responses if API fails
const USE_FALLBACK_IF_API_FAILS = true;

export const fetchChatResponse = async (messages, apiProvider = 'huggingface', promptWithAttachments = null) => {
  try {
    // Choose API method based on configuration
    if (apiProvider === 'simulate' || (!HF_API_KEY && !NLP_API_KEY)) {
      console.log('Using simulated responses as configured');
      return simulateResponse(messages, promptWithAttachments);
    }
    
    // Use the configured API
    if (apiProvider === 'nlpcloud' && NLP_API_KEY) {
      return await fetchNLPCloudResponse(messages, promptWithAttachments);
    } else {
      return await fetchHuggingFaceResponse(messages, promptWithAttachments);
    }
  } catch (error) {
    console.error('Error calling API:', error);
    if (error.response) {
      console.error('API error response:', error.response.data);
      console.error('API error status:', error.response.status);
    }
    
    // Use fallback if enabled
    if (USE_FALLBACK_IF_API_FAILS) {
      console.log('API call failed, using fallback simulated response');
      return simulateResponse(messages, promptWithAttachments);
    }
    
    throw new Error('Failed to get AI response');
  }
};

// Hugging Face API integration
const fetchHuggingFaceResponse = async (messages, promptWithAttachments) => {
  // Get message content, preferring the attachment-enhanced prompt if available
  const lastMessage = promptWithAttachments || messages[messages.length - 1].content;
  
  console.log('Sending prompt to Hugging Face API:', lastMessage);

  // Simplified request format for GPT-2 model
  const response = await axios.post(
    HF_API_URL,
    {
      inputs: lastMessage
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_KEY}`
      }
    }
  );

  console.log('Hugging Face API response:', response.data);

  // Extract the response from the API
  if (response.data && typeof response.data === 'string') {
    return response.data;
  } else if (Array.isArray(response.data) && response.data[0] && response.data[0].generated_text) {
    return response.data[0].generated_text;
  } else {
    console.error('Unexpected response format from Hugging Face:', response.data);
    throw new Error('Unexpected API response format');
  }
};

// NLP Cloud API integration (ChatGPT alternative)
const fetchNLPCloudResponse = async (messages, promptWithAttachments) => {
  // Format conversation history for NLP Cloud
  const formattedMessages = messages.map(msg => {
    // For the last message, use the enhanced prompt if available
    if (msg === messages[messages.length - 1] && promptWithAttachments) {
      return {
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: promptWithAttachments
      };
    }
    
    return {
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    };
  });
  
  console.log('Sending conversation to NLP Cloud API:', formattedMessages);

  const response = await axios.post(
    NLP_API_URL,
    {
      messages: formattedMessages
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NLP_API_KEY}`
      }
    }
  );

  console.log('NLP Cloud API response:', response.data);

  if (response.data && response.data.response) {
    return response.data.response;
  } else {
    console.error('Unexpected response format from NLP Cloud:', response.data);
    throw new Error('Unexpected API response format');
  }
};

// Simulated responses for demo purposes
const simulateResponse = (messages, promptWithAttachments) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get message content, preferring the attachment-enhanced prompt if available
      const lastMessage = (promptWithAttachments || messages[messages.length - 1].content).toLowerCase();
      
      // Check for attachment indicators
      if (lastMessage.includes("[user has attached")) {
        // Detect the type of attachment
        if (lastMessage.includes("attached a file")) {
          const fileMatch = lastMessage.match(/\[User has attached a file: (.*?)\]/);
          const fileName = fileMatch ? fileMatch[1] : "document";
          resolve(`I've received your file: ${fileName}. I can analyze the content of this file once it's properly uploaded. For now, this is a simulated response since actual file processing requires server-side implementation. In a production system, I would be able to extract text, analyze data, or process the information contained in your file.`);
        } 
        else if (lastMessage.includes("attached an image")) {
          const imageMatch = lastMessage.match(/\[User has attached an image: (.*?)\]/);
          const imageName = imageMatch ? imageMatch[1] : "image";
          resolve(`I can see you've shared an image: ${imageName}. In a production version of this chat, I would be able to analyze the image content, detect objects, read text, or describe what's in the picture. This is currently a simulated response, but image processing capabilities would be fully functional in a complete implementation.`);
        }
        else if (lastMessage.includes("attached an audio")) {
          const audioMatch = lastMessage.match(/\[User has attached an audio recording: (.*?)\]/);
          const duration = audioMatch ? audioMatch[1] : "unknown duration";
          resolve(`I've received your audio recording (${duration}). In a fully implemented system, I would transcribe this audio to text and respond based on what you said. Voice processing is a powerful feature that would be available in the production version of this chatbot.`);
        }
        else {
          resolve(`I can see you've shared an attachment. In a production system, I would process this file and respond based on its contents. For now, feel free to describe what you'd like me to help you with regarding this attachment.`);
        }
        
        return;
      }
      
      // Match more specific queries first
      if (lastMessage.includes('sum') && lastMessage.includes('number')) {
        resolve('Here\'s code to sum two numbers in various languages:\n\n**JavaScript:**\n```javascript\nfunction sum(a, b) {\n  return a + b;\n}\n\nconst result = sum(5, 3);\nconsole.log(result); // 8\n```\n\n**Python:**\n```python\ndef sum(a, b):\n    return a + b\n\nresult = sum(5, 3)\nprint(result)  # 8\n```\n\n**Java:**\n```java\npublic int sum(int a, int b) {\n    return a + b;\n}\n\n// Usage\nint result = sum(5, 3);\nSystem.out.println(result); // 8\n```');
      } 
      else if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
        resolve('Hello! I\'m your AI assistant. How can I help you today?');
      } 
      else if (lastMessage.includes('how are you')) {
        resolve('I\'m functioning well, thank you for asking! As an AI assistant, I\'m here to help you with information, coding assistance, or answering questions. What can I help you with today?');
      }
      else if ((lastMessage.includes('javascript') || lastMessage.includes('function')) && !lastMessage.includes('sum')) {
        resolve('Here\'s an example JavaScript function:\n\n```javascript\n// Efficient fibonacci calculation using memoization\nfunction fibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  \n  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);\n  return memo[n];\n}\n\n// Example usage\nconst result = fibonacci(10);\nconsole.log(result); // 55\n```\n\nThis implementation uses memoization to avoid redundant calculations, making it much more efficient than a naive recursive approach.');
      }
      else if (lastMessage.includes('react')) {
        resolve('React is a popular JavaScript library for building user interfaces, particularly single-page applications. Here\'s a modern React component example using hooks:\n\n```jsx\nimport React, { useState, useEffect } from \'react\';\n\nfunction Counter() {\n  // State hook to manage counter value\n  const [count, setCount] = useState(0);\n  const [isEven, setIsEven] = useState(true);\n  \n  // Effect hook to check if count is even\n  useEffect(() => {\n    setIsEven(count % 2 === 0);\n  }, [count]);\n  \n  return (\n    <div className="counter">\n      <h2>Counter: {count}</h2>\n      <p>The count is {isEven ? \'even\' : \'odd\'}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n      <button onClick={() => setCount(count - 1)}>\n        Decrement\n      </button>\n    </div>\n  );\n}\n\nexport default Counter;\n```\n\nThis component uses the `useState` hook to manage state and the `useEffect` hook to perform side effects when the state changes.');
      }
      else if (lastMessage.includes('ai') || lastMessage.includes('artificial intelligence')) {
        resolve('Artificial Intelligence (AI) refers to systems or machines that mimic human intelligence to perform tasks and can iteratively improve themselves based on the information they collect.\n\nKey areas of AI include:\n\n- **Machine Learning**: Algorithms that can learn from and make predictions based on data\n- **Deep Learning**: A subset of ML using neural networks with many layers\n- **Natural Language Processing**: Enabling computers to understand and generate human language\n- **Computer Vision**: Systems that can interpret and analyze visual information from the world\n- **Reinforcement Learning**: Learning through interaction with an environment to maximize rewards\n\nAI continues to transform fields like healthcare, finance, transportation, and entertainment.');
      }
      else if (lastMessage.includes('tailwind') || lastMessage.includes('css')) {
        resolve('Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without writing traditional CSS. Here\'s an example button implementation using Tailwind:\n\n```html\n<button class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline transform transition hover:-translate-y-1 hover:scale-110">\n  Click me\n</button>\n```\n\nThis creates a blue button with padding, rounded corners, and hover effects including a subtle animation. Tailwind\'s approach allows for rapid UI development without leaving your HTML or building separate CSS files.');
      }
      else if (lastMessage.includes('python')) {
        resolve('Python is a high-level, interpreted programming language known for its readability and versatility. Here\'s a Python example showing a decorators, which are a powerful feature:\n\n```python\ndef timer_decorator(func):\n    """\n    A decorator that measures and prints execution time of functions\n    """\n    import time\n    def wrapper(*args, **kwargs):\n        start_time = time.time()\n        result = func(*args, **kwargs)\n        end_time = time.time()\n        print(f"{func.__name__} executed in {end_time - start_time:.4f} seconds")\n        return result\n    return wrapper\n\n@timer_decorator\ndef calculate_fibonacci(n):\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)\n\nresult = calculate_fibonacci(20)\nprint(f"Result: {result}")\n```\n\nThis example demonstrates a decorator that measures the execution time of any function it wraps.');
      }
      else if (lastMessage.includes('image') || lastMessage.includes('upload') || lastMessage.includes('attach') || lastMessage.includes('file')) {
        resolve('I see you\'re interested in the file upload features of this chatbot. The file upload, image upload, and voice recording buttons are now fully functional!\n\n**How to use attachments:**\n1. Click the paperclip icon to attach documents (PDF, TXT, DOC, etc.)\n2. Click the image icon to upload images (JPG, PNG, GIF)\n3. Click the microphone icon to record voice input\n\nOnce you upload a file, I can analyze its contents and respond accordingly. Try it out!');
      }
      else if (lastMessage.includes('help') || lastMessage.includes('what can you do')) {
        resolve('I can help with a variety of tasks:\n\n1. **Answer questions** about programming, technology, science, etc.\n2. **Generate code** in different programming languages\n3. **Explain concepts** in a clear, understandable way\n4. **Assist with debugging** code issues\n5. **Provide examples** of implementation patterns\n6. **Process attached files** and images (use the attachment buttons)\n7. **Take voice input** (use the microphone button)\n\nFeel free to ask anything specific you\'d like help with!');
      }
      else {
        // Try to generate a helpful response based on context
        if (lastMessage.includes('code') || lastMessage.includes('program')) {
          resolve(`Here's some sample code based on your query "${lastMessage}":\n\n\`\`\`javascript\n// A simple function to demonstrate what you're asking about\nfunction processRequest(input) {\n  // Parse the input\n  const data = JSON.parse(input);\n  \n  // Process the data\n  const result = data.map(item => {\n    return {\n      id: item.id,\n      value: item.value * 2,\n      processed: true\n    };\n  });\n  \n  return result;\n}\n\`\`\`\n\nIs this the kind of code you were looking for? I can provide examples in other languages too.`);
        } else {
          resolve(`I understand you're asking about "${lastMessage}". Here's what I can tell you:\n\nThis topic involves several key concepts that are important to understand. The primary factors to consider are:\n\n1. **Context matters**: The specific details of your situation will influence the approach\n2. **Best practices**: There are established methods that can be applied\n3. **Trade-offs**: Every solution has advantages and disadvantages\n\nCould you provide more specific details about what you're trying to accomplish with "${lastMessage}" so I can give you more targeted assistance?`);
        }
      }
    }, 800); // Slightly faster response time
  });
};

// You can add more API integrations here (Hugging Face, Ollama, etc.)
// Example for Hugging Face:
/*
export const fetchHuggingFaceResponse = async (messages) => {
  try {
    const API_URL = 'https://api-inference.huggingface.co/models/gpt2';
    const HF_API_KEY = ''; // Add your Hugging Face API key

    const response = await axios.post(
      API_URL,
      {
        inputs: messages[messages.length - 1].content,
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`
        }
      }
    );

    return response.data[0].generated_text;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    throw new Error('Failed to get AI response');
  }
};
*/ 