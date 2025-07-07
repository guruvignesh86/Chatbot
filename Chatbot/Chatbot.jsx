


import { useState, useRef, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi there! Welcome to OrthoCare Clinic.\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(-1);
  const [formData, setFormData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addBotMessageWithDelay = (text, delay = 2000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text }]);
      setIsTyping(false);
    }, delay);
  };

  const handleUserMessage = async (text = null) => {
    const rawInput = (text || input).trim();
    const userText = rawInput.toLowerCase();
    if (!rawInput || isTyping) return;

    setMessages((prev) => [...prev, { sender: "user", text: rawInput }]);
    setInput("");

    // ✅ Book Appointment Trigger
 if (
  userText.includes("book appointment") ||
  userText.includes("appointment booking") ||
  userText.includes("schedule appointment") ||
  userText.includes("i want to book")
) {
  addBotMessageWithDelay("👍 Great! Let's book your appointment.");
  setTimeout(() => {
    addBotMessageWithDelay("📞 May I know your contact number?");
    setStep(1);
    setFormData({});
  }, 2200);
  return;
}


    // ✅ Clinic Address
    if (userText.includes("address") || userText.includes("location")) {
      try {
        const res = await axios.get("http://localhost:5000/clinic-address");
        const { address, landmark, phone } = res.data;
        addBotMessageWithDelay(
          `🏥 Address: ${address}\n📍 Landmark: ${landmark}\n📞 Contact: ${phone}`
        );
      } catch {
        addBotMessageWithDelay("❌ Unable to fetch clinic address.");
      }
      return;
    }

    // ✅ Doctor Info
    if (
      userText.includes("doctor info") ||
      userText.includes("doctor details") ||
      userText.includes("about doctor")
    ) {
      try {
        const res = await axios.get("http://localhost:5000/doctor-info");
        const { doctor, specialization, experience } = res.data;
        addBotMessageWithDelay(
          `🧑‍⚕️ Doctor Info:\n👨‍⚕️ Name: Dr. ${doctor}\n📚 Specialization: ${specialization}\n📆 Experience: ${experience} years`
        );
      } catch {
        addBotMessageWithDelay("❌ Unable to fetch doctor information.");
      }
      return;
    }

   
    if (
  userText.includes("availability") ||
  userText.includes("available") ||
  userText.includes("doctor available") ||
  userText.includes("available time") ||
  userText.includes("timing") ||
  userText.includes("timings")
) {

      try {
        const res = await axios.get("http://localhost:5000/doctor-availability");
        const { available_days, timings } = res.data;
        addBotMessageWithDelay(
          `📅 Doctor Availability \n🗓️ Days: ${available_days}\n⏰ Timings: ${timings}`
        );
      } catch {
        addBotMessageWithDelay("❌ Unable to fetch doctor availability.");
      }
      return;
    }

    // ✅ Booking Flow
    if (step === 1) {
      setFormData({ ...formData, contact: rawInput });
      addBotMessageWithDelay("🧍 What's your name?");
      setStep(2);
    } 
    
     else if (step === 2) {
  const updatedForm = { ...formData, name: rawInput };
  setFormData(updatedForm);
  addBotMessageWithDelay(`👋 Welcome, ${rawInput}!`);
  setTimeout(() => {
    addBotMessageWithDelay("📅 Please select a date for your appointment:");
    setShowDatePicker(true);
    setStep(3);
  }, 1500);
}

   else if (step === 4) {
  try {
    const response = await axios.post("http://localhost:5000/book-appointment", {
      name: formData.name,
      contact: formData.contact,
      date: formData.date,
      time: rawInput,
    });

    addBotMessageWithDelay(
      `✅ Appointment booked for ${formData.date} at ${rawInput}. Thank you! 😊 Our receptionist will contact you.`
    );
    setStep(-1);
    setFormData({});
  } catch (err) {
    const resData = err.response?.data;

    // ⏰ If time > 11 PM, ask to reschedule
    if (resData?.reschedule) {
      addBotMessageWithDelay(resData.error);
      // Stay on step 4 — allow user to input new time
      return;
    }

    // ⚠️ Other booking errors (double booking, formatting, etc.)
    const error = resData?.error || "❌ Something went wrong.";
    addBotMessageWithDelay(error);
    setStep(-1);
    setFormData({});
  }
}

  };

  const handleQuickReply = (command) => {
    if (isTyping) return;
    if (command === "book") {
      addBotMessageWithDelay("👍 Great! Let's book your appointment.");
      setTimeout(() => {
        addBotMessageWithDelay("📞 May I know your contact number?");
        setStep(1);
        setFormData({});
      }, 2200);
    } else if (command === "doctor-info") {
      handleUserMessage("doctor info");
    } else if (command === "availability") {
      handleUserMessage("doctor available");
    } else if (command === "address") {
      handleUserMessage("clinic address");
    }
  };

  const handleDateSelect = (dateObj) => {
    // const dateStr = dateObj.toISOString().split("T")[0];
    const dateStr = dateObj.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD in local time

    setShowDatePicker(false);
    setFormData({ ...formData, date: dateStr });
    setMessages((prev) => [...prev, { sender: "user", text: dateStr }]);
    addBotMessageWithDelay("⏰ Preferred time? (e.g., 10:30 AM)");
    setStep(4);
  };

  return (
    <div className="max-w-md mx-auto mt-10 border border-gray-300 rounded-2xl shadow-md bg-white p-4">
      <h2 className="text-xl font-bold text-center mb-4 text-blue-700">💬 OrthoCare Chatbot</h2>

      <div className="h-80 overflow-y-auto space-y-2 px-2 mb-3 bg-gray-50 rounded-lg p-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-4 py-2 rounded-xl text-sm whitespace-pre-line ${
              msg.sender === "bot"
                ? "bg-blue-100 text-left"
                : "bg-green-200 text-right ml-auto w-50"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="bg-blue-100 px-4 py-2 rounded-xl text-sm">✍️ Typing...</div>
        )}
        <div ref={messagesEndRef} />
        {showDatePicker && (
          <div className="mt-2">
            <DatePicker
              inline
              minDate={new Date()}
              onChange={(date) => handleDateSelect(date)}
            />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUserMessage()}
          disabled={showDatePicker || isTyping}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
          onClick={() => handleUserMessage()}
          disabled={showDatePicker || isTyping}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;


