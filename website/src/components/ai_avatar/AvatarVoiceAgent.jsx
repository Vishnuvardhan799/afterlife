import { useState, useEffect } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Mic, MicOff, X } from "lucide-react";
// User mentioned 'voice-assistant-icon.jpg' but it does not exist in the assets folder.
// Using 'placeholder.svg' from the public folder as a placeholder.
// Please replace with the correct image path if available.
import voiceAssistantIcon from "@/assets/voice-assistant-icon.jpg";

const AvatarVoiceAgent = ({ onClose }) => {
  const { localParticipant } = useLocalParticipant();
  const [isListening, setIsListening] = useState(
    localParticipant ? localParticipant.isMicrophoneEnabled : false
  );

  useEffect(() => {
    if (localParticipant) {
      setIsListening(localParticipant.isMicrophoneEnabled);
    }
  }, [localParticipant]);

  const toggleListening = () => {
    if (localParticipant) {
      const newListeningState = !isListening;
      localParticipant.setMicrophoneEnabled(newListeningState);
      setIsListening(newListeningState);
    }
  };

  const handleClose = () => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
    }
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#FFFFFF",
        border: "1px solid #f0f0f0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        borderRadius: "32px",
        maxWidth: "280px",
        minWidth: "240px",
        height: "64px",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
      }}
    >
      {/* Left: Mic toggle button */}
      <button
        onClick={toggleListening}
        style={{
          padding: "0.5rem",
          borderRadius: "50%",
          backgroundColor: "transparent",
          color: isListening ? "#D4AF37" : "#6b7280",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {isListening ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      {/* Center: Image */}
      <img
        src={voiceAssistantIcon}
        alt="Voice Assistant"
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "60%",
          backgroundColor: "#f3f4f6",
          objectFit: "cover",
        }}
      />

      {/* Right: Close (X) button */}
      <button
        onClick={handleClose}
        style={{
          padding: "0.5rem",
          borderRadius: "50%",
          backgroundColor: "transparent",
          color: "#6b7280",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Close"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default AvatarVoiceAgent;
