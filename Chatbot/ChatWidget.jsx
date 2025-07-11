import { useState } from "react";
import Chatbot from "./Chatbot"; 
import { MessageCircle } from "lucide-react"; 

const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition"
          onClick={() => setOpen(!open)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Chatbot Box */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-md">
          <Chatbot />
        </div>
      )}
    </>
  );
};

export default ChatWidget;
