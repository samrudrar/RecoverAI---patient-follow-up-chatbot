# WhatsApp Symptom Chatbot

A WhatsApp bot that collects patient symptoms using Twilio + Groq (LLaMA 3).

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run the Flask app
```bash
python app.py
```
The server runs on `http://localhost:5000`

### 4. Expose with ngrok
In a new terminal:
```bash
ngrok http 5000
```
Copy the HTTPS URL it gives you, e.g. `https://abc123.ngrok-free.app`

### 5. Configure Twilio Sandbox
1. Go to [Twilio Console](https://console.twilio.com/) → Messaging → Try it out → Send a WhatsApp message
2. In the **Sandbox Settings**, set the webhook URL to:
   ```
   https://abc123.ngrok-free.app/webhook
   ```
   (Make sure it's set to HTTP POST)
3. Save the settings

### 6. Test it!
- Join the Twilio sandbox by sending the join code to the sandbox number (shown in Twilio console)
- Send any message to that WhatsApp number
- The bot will greet the patient and start collecting symptoms

## Commands
- Send `reset` or `restart` to clear the conversation and start over

## Notes
- Conversation history is stored in-memory. For production, use Redis or a database.
- The bot uses `llama3-8b-8192` via Groq. You can change the model in `app.py`.
- The bot will automatically advise emergency services for critical symptoms.
