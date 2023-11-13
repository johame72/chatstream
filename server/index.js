// server\index.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;
const openaiKey = process.env.OPENAI_API_KEY;

app.use(express.static(path.join(__dirname, '../build')));

let eventStreamResponse;

app.post('/send', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const systemMessage = 'You are a helpful assistant.';
    const uid = 'user-id-placeholder';

    const payload = {
      temperature: 0.85,
      max_tokens: 4000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      user: uid,
      model: 'gpt-4',
      stream: true,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]
    };

    const responseStream = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream',
      timeout: 0
    });

    responseStream.data.on('data', (chunk) => {
      if (eventStreamResponse && !eventStreamResponse.finished) {
        eventStreamResponse.write(`data: ${chunk.toString()}\n\n`);
      }
    });

    responseStream.data.on('end', () => {
      if (eventStreamResponse && !eventStreamResponse.finished) {
        eventStreamResponse.write('data: [DONE]\n\n');
        eventStreamResponse = null; // Reset eventStreamResponse
      }
    });

    responseStream.data.on('error', (error) => {
      console.error('Stream error:', error);
      if (eventStreamResponse && !eventStreamResponse.finished) {
        eventStreamResponse.write('data: [ERROR]\n\n');
        eventStreamResponse = null; // Reset eventStreamResponse
      }
    });

    res.status(200).json({ message: 'Stream started' });
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error);
    res.status(500).send('Error processing your request');
  }
});

app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  eventStreamResponse = res;
  req.on('close', () => {
    eventStreamResponse = null; // Reset eventStreamResponse on close
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
