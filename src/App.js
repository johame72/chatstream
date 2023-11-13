// src\App.js
import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';

function App() {
  const [inputText, setInputText] = useState('');
  const [streamedContent, setStreamedContent] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  function parseStreamedData(dataString) {
    try {
      const lines = dataString.split('\n');
      const trimmedData = lines.map(line => line.replace(/^data: /, "").trim());
      const filteredData = trimmedData.filter(line => !["", "[DONE]"].includes(line));
      
      // Handle cases where JSON objects span multiple lines
      let jsonDataAccumulator = '';
      const parsedData = filteredData.map(line => {
        jsonDataAccumulator += line;
        try {
          const parsedJson = JSON.parse(jsonDataAccumulator);
          jsonDataAccumulator = ''; // Reset the accumulator on successful parse
          return parsedJson;
        } catch {
          // If JSON is incomplete, wait for more data
          return null;
        }
      }).filter(item => item !== null); // Filter out null values (incomplete JSON objects)
      
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

      setStreamedContent(''); // Reset the streamed content
      setInputText(''); // Clear the input
    } catch (error) {
      console.error('Problem with fetch operation:', error);
    }
  };

  return (
    <div className="App">
      <h1>Real-time Streaming with OpenAI and SSE</h1>
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
