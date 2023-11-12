import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';

function App() {
  const [inputText, setInputText] = useState('');
  const [streamedContent, setStreamedContent] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  function parseStreamedData(dataString) {
    try {
      let jsonDataAccumulator = '';
      const lines = dataString.split('\n');
      const parsedData = [];

      lines.forEach(line => {
        line = line.replace(/^data: /, '').trim();

        if (line === '[DONE]') {
          return;
        }

        jsonDataAccumulator += line;

        try {
          const parsedJson = JSON.parse(jsonDataAccumulator);
          parsedData.push(parsedJson);
          jsonDataAccumulator = '';
        } catch {
          // Wait for more chunks
        }
      });

      return parsedData;
    } catch (error) {
      console.error('Error parsing chunk:', error);
      return [];
    }
  }

  useEffect(() => {
    const eventSource = new EventSource(`${apiUrl}/stream`);

    eventSource.onmessage = function(event) {
      console.log("Raw data:", event.data);
      const parsedChunks = parseStreamedData(event.data);
      parsedChunks.forEach(chunk => {
        if (chunk.choices && chunk.choices.length > 0) {
          const content = chunk.choices[0].delta.content;
          if (content) {
            setStreamedContent(currentContent => currentContent + content);
          }
        }
      });
    };

    eventSource.onerror = function(event) {
      console.error('EventSource failed:', event);
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

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

      setStreamedContent('');
      setInputText('');
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  return (
    <div className="App">
      <h1>Bu's Corner - Real-time Streaming w/ SSE</h1>
      <input 
        type="text" 
        value={inputText} 
        onChange={handleInputChange}
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
