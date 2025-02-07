import {
    RTCPeerConnection,
    RTCSessionDescription,
    MediaStream,
    MediaStreamTrack,
    mediaDevices,
    RTCDataChannel,
} from 'react-native-webrtc-web-shim';
import * as API from '@libs/API';
import {playStreamSound} from '@libs/Sound';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import type {OpenAIRealtimeMessage, ConnectionResult, WebRTCConnections} from './types';

let currentAdminsReportID: number | null = null;

let connections: WebRTCConnections = {
  openai: null,
  screen: null,
};

async function connectToOpenAIRealtime(): Promise<ConnectionResult> {
    return new Promise(async (resolve, reject) => {
      try {

        // Get ephemeral token 
        const emphemeralTokenResponse = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_EMPHEMERAL_TOKEN, {});
        const ephemeralToken = emphemeralTokenResponse.client_secret.value;
        console.log('ephemeralToken', ephemeralToken);

        // 1. Create peer connection
        const pc = (new RTCPeerConnection({
            iceServers: [],
        } as RTCConfiguration) as unknown) as RTCPeerConnection;
  
        // 2. Add local audio track
        const stream = await mediaDevices.getUserMedia({ audio: true }) as MediaStream;
        const audioTrack = stream.getAudioTracks()[0] as MediaStreamTrack;
        pc.addTrack(audioTrack);
  
        // 3. Create data channel for API control
        const dataChannel = pc.createDataChannel('openai-control');
  
        // Handle ICE connection state changes
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'failed') {
            reject(new Error('ICE connection failed'));
          }
        };

        // Add remote stream listener
        pc.ontrack = (event) => {
          if (event.track.kind === 'audio') {
            playStreamSound(event.streams[0]);
          }
        };

  
        // 4. Handle SDP exchange
        const offer: RTCSessionDescriptionInit = await pc.createOffer();
        await pc.setLocalDescription(offer);
  
        // 5. Connect to OpenAI endpoint
        const response = await fetch('https://api.openai.com/v1/realtime', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ephemeralToken}`,
            'Content-Type': 'application/sdp'
          },
          body: offer.sdp
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        // 6. Set remote description
        const answer: string = await response.text();
        await pc.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: answer
        }));
  
        // Configure data channel handling
        dataChannel.onerror = (event: RTCErrorEvent) => {
          reject(new Error(`Data channel error: ${event.error.message}`));
        };
  
        resolve({ pc, dataChannel });
  
      } catch (error) {
        if (error instanceof Error) {
          reject(new Error(`Connection failed: ${error.message}`));
        } else {
          reject(new Error('Unknown connection error occurred'));
        }
      }
    });
  }

async function initializeConnection(type: 'openai' | 'screen', adminsReportID: number) {
  currentAdminsReportID = adminsReportID;
  if (type === 'openai') {
      const connection = await connectToOpenAIRealtime();
      connections.openai = connection;
      
      connection.dataChannel.onmessage = (event: MessageEvent) => {
          const message: OpenAIRealtimeMessage = JSON.parse(event.data);
          handleOpenAIMessage(message, connection.dataChannel);
      };

      return connection;
  }
  throw new Error('Screen sharing now handled through direct API calls');
}

function handleOpenAIMessage(message: OpenAIRealtimeMessage, dataChannel: RTCDataChannel) {
  switch (message.type) {
    case 'audio':
        // Handle audio data
        break;
    case 'transcript':
        // Handle transcript update
        break;
    case 'response.function_call_arguments.done':
      handleFunctionCall(message);
      break;
    case 'error':
        console.error('[WebRTC] OpenAI error:', {message: message.message});
        break;
  }
}

function handleFunctionCall(message: OpenAIRealtimeMessage) {
  if (message.name === 'SendRecapInAdminsRoom') {
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.SEND_RECAP_IN_ADMINS_ROOM, {
      ...JSON.parse(message.arguments),
      reportID: currentAdminsReportID
    });
  }
}

function getConnection(type: 'openai' | 'screen'): ConnectionResult | null {
    return connections[type];
}

export {
    initializeConnection,
    getConnection,
    handleOpenAIMessage,
};
  
  