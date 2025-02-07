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

let currentScreenCaptureDescription: string | null = null;

let connections: WebRTCConnections = {
  openai: null,
  screen: null,
};

let screenCaptureCleanup: (() => void) | null = null;

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

async function startScreenRecording(openaiConn: ConnectionResult) {
    if (screenCaptureCleanup) {
        return;
    }

    let isCapturing = true;
    let lastCaptureTime = 0;
    const CAPTURE_INTERVAL = 10000;
    const JPEG_QUALITY = 0.6;

    try {
        const stream = await mediaDevices.getDisplayMedia({ 
            video: { 
                frameRate: { ideal: 1 },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false 
        });

        const videoTrack = stream.getVideoTracks()[0];
        const video = document.createElement('video');
        video.srcObject = new MediaStream([videoTrack]);
        video.autoplay = true;

        // Wait for video to be ready
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve(null);
            };
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });

        const capture = async () => {
            if (!isCapturing || !ctx || !video.videoWidth) return;
            const currentTime = Date.now();
            if (currentTime - lastCaptureTime < CAPTURE_INTERVAL) {
                requestAnimationFrame(capture);
                return;
            }

            try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);

                const blob = await new Promise<Blob>((resolve) => 
                    canvas.toBlob((b) => resolve(b!), 'image/jpeg', JPEG_QUALITY)
                );

                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });

                console.log('[JACK] base64', base64);

                // Send to API endpoint
                const response = await API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.DESCRIBE_IMAGE, {
                  base64image: base64
                });

                console.log('[JACK] response', response);

                // TODO Update this to use the actual description
                currentScreenCaptureDescription = 'The screen is entirely blue with red dots';
                
                 /** 
                if (response.ok) {
                    const data = await response.json();
                    if (data.description) {
                        openaiConn.dataChannel.send(JSON.stringify({
                            type: 'screen_description',
                            description: data.description
                        }));
                    }
                }
                */

                lastCaptureTime = currentTime;
                requestAnimationFrame(capture);
            } catch (error) {
                console.error('[WebRTC] Capture error:', error);
                requestAnimationFrame(capture);
            }
        };

        // Start the capture loop
        requestAnimationFrame(capture);

        screenCaptureCleanup = () => {
            isCapturing = false;
            stream.getTracks().forEach(track => track.stop());
            screenCaptureCleanup = null;
        };

    } catch (error) {
        console.error('[WebRTC] Screen capture error:', error);
        screenCaptureCleanup = null;
        throw error;
    }
}

function stopScreenRecording() {
  if (screenCaptureCleanup) {
      screenCaptureCleanup();
  }

  // Close OpenAI connection if it exists
  const existingConnection = connections.openai;
  if (existingConnection) {
      existingConnection.pc.close();
      existingConnection.dataChannel.close();
      connections.openai = null;
  }
}

async function initializeConnection(type: 'openai' | 'screen') {
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
    case 'input_audio_buffer.speech_stopped':
      handleUserSpeechStopped(dataChannel);
      break;
    case 'error':
        console.error('[WebRTC] OpenAI error:', {message: message.message});
        break;
  }
}

function handleUserSpeechStopped(dataChannel: RTCDataChannel) {
  dataChannel.send(JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'user',
      content: {
        type: 'input_text',
        text: currentScreenCaptureDescription
      }
    }
  }));
}

function handleFunctionCall(message: OpenAIRealtimeMessage) {
  const args = JSON.parse(message.arguments);
  switch (message.name) {
    case 'UpdateIntroSelectedNVP':
      return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.UPDATE_INTRO_SELECTED_NVP, {
          choice: args.choice,
      });
    default:
      return Promise.resolve(null);
  // Add other function handlers
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
    startScreenRecording,
    stopScreenRecording,
};
  
  