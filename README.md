# 🌟 Real-time Streaming App with OpenAI and SSE 🌟

This project is a full-stack web application that demonstrates real-time streaming capabilities using Server-Sent Events (SSE) and integrates with OpenAI's GPT-4 model for generating dynamic responses. It's built using React for the frontend and Node.js for the backend.

## Features ✨

- **Real-time Data Streaming:** Utilizes SSE for pushing real-time updates from the server to the client.
- **OpenAI GPT-4 Integration:** Leverages the power of OpenAI's GPT-4 for intelligent, context-aware responses.
- **Responsive Design:** Crafted with a mobile-first approach for a seamless experience across various devices.

## Getting Started 🚀

To get this project up and running on your local machine for development and testing purposes, follow these steps:

1. **Clone the Repository**
   
   ```bash
   git clone https://github.com/johame72/realtime-streaming-openai.git
   cd realtime-streaming-openai
   ```

2. **Install Dependencies**

   - Frontend:
     ```bash
     npm install
     ```
   - Backend (inside the `server` directory):
     ```bash
     npm install
     ```

3. **Environment Variables**

   Set up your `.env` file with the necessary API keys and configurations:
   - For the backend (`server/.env`):
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```
   - For the frontend (`.env`):
     ```
     REACT_APP_API_URL=http://localhost:3001
     ```

4. **Run the Application**

   - Start the backend server:
     ```bash
     node server/index.js
     ```
   - In a new terminal, start the React app:
     ```bash
     npm start
     ```

## Technologies Used 💻

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **APIs:** OpenAI GPT-4
- **Deployment:** Heroku (frontend/backend)

## Contributing 🤝

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](link-to-your-issues-page). Please follow the [contributing guidelines](link-to-your-contributing-guide).

## Authors 👨‍💻

- **John Merkel** - _Initial work_ - [johame72](https://github.com/johame72)

See also the list of [contributors](https://github.com/your-repo/realtime-streaming-openai/contributors) who participated in this project.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🎉

- Special thanks to OpenAI for providing the GPT-4 API.
- Hat tip to anyone whose code was used.
- Inspiration, etc.
