type OpenAIRealtimeMessage = {type: 'audio'; data: string;} | {type: 'transcript'; text: string;} | {type: 'error'; code: number; message: string;} | {type: 'input_audio_buffer.speech_stopped'};

type ConnectionResult = {
    pc: RTCPeerConnection;
    dataChannel: RTCDataChannel;
};

type WebRTCConnections = {
    openai: ConnectionResult | null;
    screen: ConnectionResult | null;
};

export type {OpenAIRealtimeMessage, ConnectionResult, WebRTCConnections};
