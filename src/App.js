// src\App.js
import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';
function App() {
  const [inputText, setInputText] = useState('');
  const [streamedContent, setStreamedContent] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  async function fetchStreamedData() {
    try {
      const response = await fetch(`${apiUrl}/stream`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        console.log("Raw data:", chunk); // Log raw data
        const lines = chunk.split("\n");
        const parsedLines = lines
          .map(line => line.replace(/^data: /, "").trim())
          .filter(line => line !== "" && line !== "[DONE]")
          .map(line => JSON.parse(line));
        for (const parsedLine of parsedLines) {
          const { choices } = parsedLine;
          const { delta } = choices[0];
          const { content } = delta;
          if (content) {
            setStreamedContent(currentContent => currentContent + content);
          }
        }
      }
    } catch (error) {
      console.error('Error in stream:', error);
    }
  }
  useEffect(() => {
    fetchStreamedData();
  }, [apiUrl]);
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  const handleSubmit = async () => {
    try {
      await fetch(`${apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });
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
