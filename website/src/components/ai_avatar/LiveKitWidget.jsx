import { useState, useCallback, useEffect } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import AvatarVoiceAgent from "./AvatarVoiceAgent";

const LiveKitWidget = ({ setShowSupport, voiceOnly = false }) => {
  const [token, setToken] = useState(null);

  const getToken = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/getToken?name=${encodeURIComponent("admin")}`
      );
      const tokenData = await response.text();
      setToken(tokenData);
    } catch (error) {
      console.error("Error fetching token:", error);
      setShowSupport(false); // Close widget on error
    }
  }, [setShowSupport]);

  useEffect(() => {
    getToken();
  }, [getToken]);

  const connectOptions = {
    audio: true,
    video: !voiceOnly,
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
    },
    ...(!voiceOnly && {
      videoCaptureDefaults: {
        resolution: { width: 640, height: 480 },
        frameRate: 24,
      },
    }),
    dynacast: true,
    adaptiveStream: true,
    stopLocalTrackOnUnpublish: true,
  };

  if (!token) {
    // Still fetching token, render nothing
    return null;
  }

  return (
    <LiveKitRoom
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      token={token}
      connect={true}
      connectOptions={connectOptions}
      onDisconnected={() => setShowSupport(false)}
    >
      <RoomAudioRenderer />
      <AvatarVoiceAgent onClose={() => setShowSupport(false)} />
    </LiveKitRoom>
  );
};

export default LiveKitWidget;
