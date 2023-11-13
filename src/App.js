import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';

const useChat = (apiUrl) => {
  const [inputText, setInputText] = useState('');
  const [streamedContent, setStreamedContent] = useState('');

  const parseStreamedData = (dataString) => {
    const lines = dataString.split('\n');
    const trimmedData = lines.map(line => line.replace(/^data: /, "").trim());
    const filteredData = trimmedData.filter(line => !["", "[DONE]"].includes(line));
    const parsedData = filteredData.map(line => JSON.parse(line));
    
    return parsedData;
  }

  const handleStreamedData = (dataString) => {
    const parsedChunks = parseStreamedData(dataString);
    parsedChunks.forEach(data => {
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].delta.content;
        if (content) {
          setStreamedContent(currentContent => currentContent + content);
        }
      }
    });
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setInputText(''); // Clear the input
      setStreamedContent(''); // Reset the streamed content
    } catch (error) {
      console.error('Problem with fetch operation:', error);
    }
  };

  useEffect(() => {
    const eventSource = new EventSource(`${apiUrl}/stream`);
    eventSource.onmessage = (event) => {
      handleStreamedData(event.data);
    };

    eventSource.onerror = (event) => {
      console.error('EventSource failed:', event);
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl]);

  return { inputText, setInputText, streamedContent, handleSubmit };
};

function App() {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const { inputText, setInputText, streamedContent, handleSubmit } = useChat(apiUrl);

  return (
    <div className="App">
      <h1>Real-time Streaming with OpenAI and SSE</h1>
      <input 
        type="text" 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={handleSubmit}>
        Send
      </button>
      <div>
        <h2>Streamed Responses:</h2>
        <FormattedText text={streamedContent} />
      </div>
    </div>
  );
}

export default App;
