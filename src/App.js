import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';

const useChat = (apiUrl) => {
  const [inputText, setInputText] = useState('');
  const [streamedContent, setStreamedContent] = useState('');
  let incompleteData = ''; // To hold incomplete data chunks

  const handleStreamedData = (dataString) => {
    // Append any previously incomplete data
    const completeData = incompleteData + dataString;
    incompleteData = ''; // Reset incomplete data

    const lines = completeData.split('\n');
    lines.forEach((line, index) => {
      line = line.replace(/^data: /, "").trim();
      if (["", "[DONE]"].includes(line)) return;

      try {
        const parsedLine = JSON.parse(line);
        if (parsedLine.choices && parsedLine.choices.length > 0) {
          const content = parsedLine.choices[0].delta.content;
          if (content) {
            setStreamedContent(currentContent => currentContent + content);
          }
        }
      } catch (e) {
        // If parsing fails, assume data is incomplete
        // Save it to append to the next chunk
        incompleteData = lines.slice(index).join('\n');
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
