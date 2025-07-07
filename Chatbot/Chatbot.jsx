


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
// import { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// const Chatbot = () => {
//   const [messages, setMessages] = useState([
//     {
//       sender: "bot",
//       text: "👋 Hi there! Welcome to OrthoCare Clinic.\nHow can I help you today?",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [step, setStep] = useState(-1);
//   const [formData, setFormData] = useState({});
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const addBotMessageWithDelay = (text, delay = 1000) => {
//     setIsTyping(true);
//     setTimeout(() => {
//       setMessages((prev) => [...prev, { sender: "bot", text }]);
//       setIsTyping(false);
//     }, delay);
//   };

//   const handleUserMessage = async (text = null) => {
//     const rawInput = (text || input).trim();
//     const userText = rawInput.toLowerCase();
//     if (!rawInput || isTyping) return;

//     setMessages((prev) => [...prev, { sender: "user", text: rawInput }]);
//     setInput("");

//     // Step-Based Booking Flow
//     if (step === -1) {
//       if (
//         userText.includes("book") ||
//         userText.includes("appointment") ||
//         userText.includes("schedule")
//       ) {
//         addBotMessageWithDelay("📞 Sure, may I have your contact number?");
//         setStep(1);
//         return;
//       }

//       if (userText.includes("address")) {
//         try {
//           const res = await axios.get("http://localhost:5000/clinic-address");
//           const { address, landmark, phone } = res.data;
//           addBotMessageWithDelay(`🏥 Address: ${address}\n📍 Landmark: ${landmark}\n📞 Phone: ${phone}`);
//         } catch {
//           addBotMessageWithDelay("❌ Failed to fetch address.");
//         }
//         return;
//       }

//       if (userText.includes("doctor")) {
//         try {
//           const res = await axios.get("http://localhost:5000/doctor-info");
//           const { doctor, specialization, experience } = res.data;
//           addBotMessageWithDelay(`👨‍⚕️ Dr. ${doctor}\n📚 Specialization: ${specialization}\n📆 ${experience} years`);
//         } catch {
//           addBotMessageWithDelay("❌ Failed to fetch doctor info.");
//         }
//         return;
//       }

//       if (userText.includes("availability") || userText.includes("timings")) {
//         try {
//           const res = await axios.get("http://localhost:5000/doctor-availability");
//           const { available_days, timings } = res.data;
//           addBotMessageWithDelay(`📅 Days: ${available_days}\n⏰ Timings: ${timings}`);
//         } catch {
//           addBotMessageWithDelay("❌ Failed to fetch availability.");
//         }
//         return;
//       }

//       addBotMessageWithDelay("🤖 I can help with booking, timings, address, or doctor info.");
//       return;
//     }

//     // Booking Steps
//     switch (step) {
//       case 1:
//         setFormData({ contact: rawInput });
//         addBotMessageWithDelay("👤 May I know your full name?");
//         setStep(2);
//         break;

//       case 2:
//         setFormData((prev) => ({ ...prev, name: rawInput }));
//         addBotMessageWithDelay("🎂 What is your age?");
//         setStep(3);
//         break;

//       case 3:
//         if (!/^\d{1,3}$/.test(rawInput)) {
//           addBotMessageWithDelay("❌ Please enter a valid age.");
//           return;
//         }
//         setFormData((prev) => ({ ...prev, age: parseInt(rawInput) }));
//         addBotMessageWithDelay("🚻 What is your gender? (Male/Female/Other)");
//         setStep(4);
//         break;

//       case 4:
//         const gender = rawInput.toLowerCase();
//         if (!["male", "female", "other"].includes(gender)) {
//           addBotMessageWithDelay("❌ Please enter Male, Female, or Other.");
//           return;
//         }
//         setFormData((prev) => ({ ...prev, gender: gender.charAt(0).toUpperCase() + gender.slice(1) }));
//         addBotMessageWithDelay("📅 Please select a preferred date:");
//         setShowDatePicker(true);
//         setStep(5);
//         break;

//       case 6:
//         const timeInput = rawInput.replace(".", ":");
//         setFormData((prev) => ({ ...prev, time: timeInput }));

//         try {
//           const res = await axios.post("http://localhost:5000/book-appointment", {
//             name: formData.name,
//             contact: formData.contact,
//             age: formData.age,
//             gender: formData.gender,
//             date: formData.date,
//             time: timeInput,
//           });

//           addBotMessageWithDelay(`✅ Appointment confirmed on ${formData.date} at ${timeInput}.`);
//         } catch (err) {
//           const error = err.response?.data?.error || "❌ Booking failed.";
//           addBotMessageWithDelay(error);
//         }

//         setFormData({});
//         setStep(-1);
//         break;

//       default:
//         break;
//     }
//   };

//   const handleDateSelect = (dateObj) => {
//     const dateStr = dateObj.toLocaleDateString("en-CA"); // YYYY-MM-DD
//     setShowDatePicker(false);
//     setFormData((prev) => ({ ...prev, date: dateStr }));
//     setMessages((prev) => [...prev, { sender: "user", text: dateStr }]);
//     addBotMessageWithDelay("⏰ At what time? (e.g., 10:00 AM)");
//     setStep(6);
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-4 bg-white shadow-md rounded-2xl border border-gray-200">
//       <h2 className="text-center text-xl font-semibold text-blue-700 mb-4">💬 OrthoCare Chatbot</h2>

//       <div className="h-80 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-2">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`whitespace-pre-line px-4 py-2 rounded-xl text-sm ${
//               msg.sender === "bot"
//                 ? "bg-blue-100 text-left"
//                 : "bg-green-200 text-right ml-auto"
//             }`}
//           >
//             {msg.text}
//           </div>
//         ))}
//         {isTyping && <div className="bg-blue-100 px-4 py-2 rounded-xl text-sm">✍️ Typing...</div>}
//         <div ref={messagesEndRef} />
//         {showDatePicker && (
//           <div className="mt-2">
//             <DatePicker
//               inline
//               minDate={new Date()}
//               onChange={handleDateSelect}
//             />
//           </div>
//         )}
//       </div>

//       {/* Input */}
//       <div className="flex gap-2 mt-4">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleUserMessage()}
//           disabled={showDatePicker || isTyping}
//         />
//         <button
//           onClick={() => handleUserMessage()}
//           disabled={showDatePicker || isTyping}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;
