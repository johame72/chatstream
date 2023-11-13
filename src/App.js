// src\App.js
import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';
function App() {
  const [inputText, setInputText] = useState('');
  const [streamedContent, setStreamedContent] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
function parseStreamedData(dataString) {
  try {
    // Accumulator for JSON data
    let jsonDataAccumulator = '';
    const lines = dataString.split('\n');
    const parsedData = [];
    lines.forEach(line => {
      // Remove 'data: ' prefix and trim
      line = line.replace(/^data: /, '').trim();
      // Check if line indicates end of data stream
      if (line === '[DONE]') {
        return;
      }
      // Accumulate JSON data
      jsonDataAccumulator += line;
      // Try to parse the accumulated data
      try {
        const parsedJson = JSON.parse(jsonDataAccumulator);
        // If parse is successful, reset the accumulator and add parsed JSON to parsedData
        jsonDataAccumulator = '';
        parsedData.push(parsedJson);
      } catch {
        // If JSON is incomplete, wait for more data (do not reset jsonDataAccumulator)
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
      console.log("Raw data:", event.data); // Add this line
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
      console.error('There has been a problem with your fetch operation:', error);
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
