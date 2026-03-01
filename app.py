print("step 1")
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from groq import Groq
import os
print("step 2")

app = Flask(__name__)
print("step 3")

groq_client = Groq(api_key=os.environ.get("API_KEY"))
print("step 4")

conversation_history = {}

SYSTEM_PROMPT = "You are a medical intake assistant. Ask patients about their symptoms concisely."

def get_ai_response(user_phone, user_message):
    if user_phone not in conversation_history:
        conversation_history[user_phone] = []
    conversation_history[user_phone].append({"role": "user", "content": user_message})
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}] + conversation_history[user_phone][-10:],
        max_tokens=200
    )
    reply = response.choices[0].message.content
    conversation_history[user_phone].append({"role": "assistant", "content": reply})
    return reply

@app.route("/webhook", methods=["POST"])
def webhook():
    try:
        incoming_msg = request.form.get("Body", "Hello").strip()
        sender = request.form.get("From", "")
        print(f"From: {sender}, Msg: {incoming_msg}")
        reply = get_ai_response(sender, incoming_msg)
        resp = MessagingResponse()
        resp.message(reply)
        return str(resp)
    except Exception as e:
        import traceback
        traceback.print_exc()
        resp = MessagingResponse()
        resp.message(f"Error: {str(e)}")
        return str(resp), 200

@app.route("/health")
def health():
    return "ok"

print("step 5 - starting server")
if __name__ == "__main__":
    app.run(debug=False, port=5000)
