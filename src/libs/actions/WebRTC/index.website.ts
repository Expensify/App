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

  function startScreenCapture(openaiConn: ConnectionResult) {
    let isCapturing = true;

    const captureAndSend = async () => {
        try {
            const stream = await mediaDevices.getDisplayMedia({ 
                video: true,
                audio: false 
            });

            const videoTrack = stream.getVideoTracks()[0];
            const video = document.createElement('video');
            video.srcObject = new MediaStream([videoTrack]);
            video.autoplay = true;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            while (isCapturing && openaiConn) {
                if (!ctx || !video.videoWidth) continue;
                
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);

                const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8));
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });

                await fetch('/api/screen-capture', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ image: base64 })
                });

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('[WebRTC] Screen capture error:', error);
        }
    };

    captureAndSend();
    return () => { isCapturing = false; };
}

async function initializeConnection(type: 'openai' | 'screen') {
  if (type === 'openai') {
      const connection = await connectToOpenAIRealtime();
      connections.openai = connection;
      
      connection.dataChannel.onmessage = (event: MessageEvent) => {
          const message: OpenAIRealtimeMessage = JSON.parse(event.data);
          handleOpenAIMessage(message);
      };

      return connection;
  }
  throw new Error('Screen sharing now handled through direct API calls');
}

function handleOpenAIMessage(message: OpenAIRealtimeMessage) {
  switch (message.type) {
      case 'audio':
          // Handle audio data
          break;
      case 'transcript':
          // Handle transcript update
          break;
      case 'error':
          console.error('[WebRTC] OpenAI error:', {message: message.message});
          break;
  }
}

function getConnection(type: 'openai' | 'screen'): ConnectionResult | null {
    return connections[type];
}

function stopScreenCapture(connection: ConnectionResult) {
    const existingConnection = connections.openai;
    if (existingConnection) {
        existingConnection.pc.close();
        existingConnection.dataChannel.close();
        connections.openai = null;
    }

    // Stop all tracks from the screen capture
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
        })
        .catch(console.error);
}

export {
    initializeConnection,
    getConnection,
    handleOpenAIMessage,
    startScreenCapture,
    stopScreenCapture,
};
  
  