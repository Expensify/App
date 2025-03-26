/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Onyx from 'react-native-onyx';
import {mediaDevices} from 'react-native-webrtc-web-shim';
import * as API from '@libs/API';
import type {SendRecapInAdminsRoomParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {playStreamSound} from '@libs/Sound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

type ConnectionResult = {
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
};

type WebRTCConnections = {
    openai: ConnectionResult | null;
};

type OpenAITranscriptDelta = {
    type: string;
    delta: {
        text: string;
    };
};

type OpenAIRealtimeMessage = {
    name: string;
    arguments: string;
    type: string;
    delta?: {
        text: string;
    };
};

type Recap = {
    recap: string;
};

let currentAdminsReportID: number | null = null;
let mediaStream: MediaStream | null = null;
let currentTranscript = '';

const connections: WebRTCConnections = {
    openai: null,
};

// Add a debug configuration object at the top of the file
const WEBRTC_DEBUG = {
    verbose: true, // Set to true in development for verbose logging
    audioLevels: true, // Set to true to log microphone levels
    silenceWarningInterval: 10000, // Only warn about silence every 10 seconds
};

function getEmphemeralToken(): Promise<string> {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.TALK_TO_AI_SALES}`,
                value: {
                    isLoading: true,
                },
            },
        ],
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.TALK_TO_AI_SALES}`,
                value: {
                    isLoading: false,
                },
            },
        ],
    };

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_EMPHEMERAL_TOKEN, {}, onyxData)
        .then((response) => {
            return response?.client_secret?.value ?? '';
        })
        .catch((error) => {
            console.error(error);
            return '';
        });
}

function connectUsingSDP(ephemeralToken: string, rtcOffer: RTCSessionDescriptionInit): Promise<Response> {
    return fetch(CONST.OPEN_AI_REALTIME_API, {
        method: CONST.NETWORK.METHOD.POST,
        headers: {
            Authorization: `Bearer ${ephemeralToken}`,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/sdp',
        },
        body: rtcOffer.sdp,
    });
}

// Simplify the audio level monitoring function to only log issues
function setupAudioLevelMonitoring(stream: MediaStream) {
    console.log('[WebRTC] Setting up audio level monitoring');
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        audioSource.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let silenceCounter = 0;
        const maxSilenceCount = 5;
        let lastWarnTime = 0;
        
        // Remove the per-frame logging completely
        const checkAudioLevel = () => {
            if (!stream.active) {
                console.log('[WebRTC] Audio stream no longer active, stopping monitoring');
                return;
            }
            
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate audio level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            
            if (average < 5) {
                silenceCounter++;
                
                // Only warn periodically instead of spamming the console
                const now = Date.now();
                if (silenceCounter >= maxSilenceCount && (now - lastWarnTime > WEBRTC_DEBUG.silenceWarningInterval)) {
                    console.warn('[WebRTC] Possible microphone issue - low audio levels detected');
                    lastWarnTime = now;
                    // Removed UI feedback via Onyx
                }
            } else {
                silenceCounter = 0;
                
                // Only log audio levels when debug is enabled
                if (WEBRTC_DEBUG.audioLevels && (Date.now() - lastWarnTime > 3000)) {
                    console.log(`[WebRTC] Microphone level: ${average.toFixed(2)}`);
                    lastWarnTime = Date.now();
                }
            }
            
            // Continue monitoring
            requestAnimationFrame(checkAudioLevel);
        };
        
        // Start monitoring
        checkAudioLevel();
        
        return {
            stop: () => {
                console.log('[WebRTC] Stopping audio monitoring');
                audioSource.disconnect();
                audioContext.close();
            }
        };
    } catch (error) {
        console.error('[WebRTC] Failed to setup audio monitoring:', error);
        return { stop: () => {} };
    }
}

// Add function to enumerate audio devices for debugging
async function listAudioDevices() {
    try {
        console.log('[WebRTC] Enumerating audio devices');
        const devices = await mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        console.log('[WebRTC] Available audio devices:', audioInputDevices.map(device => ({
            deviceId: device.deviceId,
            label: device.label || 'Unlabeled Device'
        })));
        return audioInputDevices;
    } catch (error) {
        console.error('[WebRTC] Error listing audio devices:', error);
        return [];
    }
}

function connectToOpenAIRealtime(): Promise<ConnectionResult> {
    let peerConnection: RTCPeerConnection;
    let rtcOffer: RTCSessionDescriptionInit;
    let dataChannel: RTCDataChannel;
    let audioMonitor: { stop: () => void } | null = null;

    console.log('[WebRTC] Starting OpenAI connection...');
    
    // First, list available audio devices for debugging
    return listAudioDevices()
        .then(() => {
            // Enhanced audio constraints for better quality
            const audioConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            };
            
            console.log('[WebRTC] Requesting user media with constraints:', audioConstraints);
            
            return new Promise<ConnectionResult>((resolve, reject) => {
                mediaDevices
                    .getUserMedia(audioConstraints)
                    .then((stream: MediaStream) => {
                        console.log('[WebRTC] Got user media stream');
                        mediaStream = stream;
                        
                        // Setup audio monitoring
                        audioMonitor = setupAudioLevelMonitoring(stream);
                        
                        const pc = new RTCPeerConnection({
                            iceServers: [],
                        });
                        
                        console.log('[WebRTC] Created peer connection');
                        
                        // Only log significant connection state changes
                        pc.onconnectionstatechange = () => {
                            console.log(`[WebRTC] Connection state changed: ${pc.connectionState}`);
                            
                            // Update connection state in Onyx
                            Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {
                                connectionState: pc.connectionState
                            });
                        };
                        
                        // Log signaling state changes
                        pc.onsignalingstatechange = () => {
                            console.log(`[WebRTC] Signaling state changed: ${pc.signalingState}`);
                        };

                        const audioTrack = stream.getAudioTracks().at(0);
                        if (!audioTrack) {
                            const error = new Error('Failed to get audio track');
                            console.error('[WebRTC] Error:', error);
                            reject(error);
                            return;
                        }

                        pc.addTrack(audioTrack);
                        console.log('[WebRTC] Added audio track to peer connection');

                        const dc = pc.createDataChannel('openai-control');
                        console.log('[WebRTC] Created data channel');
                        
                        dc.onopen = () => {
                            console.log('[WebRTC] Data channel opened');
                        };
                        
                        dc.onerror = (error) => {
                            console.error('[WebRTC] Data channel error:', error);
                            reject(new Error(`Data channel error`));
                        };
                        
                        dataChannel = dc;

                        // Enhanced ICE connection state logging
                        pc.oniceconnectionstatechange = () => {
                            console.log(`[WebRTC] ICE connection state changed: ${pc.iceConnectionState}`);
                            
                            if (pc.iceConnectionState === 'failed') {
                                console.error('[WebRTC] ICE connection failed');
                                reject(new Error('ICE connection failed'));
                                stopConnection();
                            }
                        };

                        // Add ICE candidate logging only in verbose mode
                        pc.onicecandidate = (event) => {
                            if (event.candidate && WEBRTC_DEBUG.verbose) {
                                console.log('[WebRTC] New ICE candidate:', event.candidate.candidate);
                            } else if (!event.candidate) {
                                console.log('[WebRTC] ICE candidate gathering complete');
                            }
                        };
                        
                        pc.onicegatheringstatechange = () => {
                            console.log(`[WebRTC] ICE gathering state: ${pc.iceGatheringState}`);
                        };

                        // Enhanced track handling
                        pc.ontrack = (event) => {
                            console.log('[WebRTC] Track received:', event.track.kind);
                            if (event.track.kind === 'audio') {
                                const audioStream = event.streams.at(0);
                                if (!audioStream) {
                                    console.error('[WebRTC] Failed to get stream from track event');
                                    reject(new Error('Failed to get stream'));
                                    stopConnection();
                                    return;
                                }
                                console.log('[WebRTC] Playing audio stream');
                                playStreamSound(audioStream);
                            }
                        };

                        peerConnection = pc;
                        console.log('[WebRTC] Creating offer');
                        return peerConnection.createOffer();
                    })
                    .then((offer: RTCSessionDescriptionInit) => {
                        console.log('[WebRTC] Setting local description');
                        peerConnection.setLocalDescription(offer);
                        rtcOffer = offer;
                    })
                    .then(() => {
                        console.log('[WebRTC] Getting ephemeral token');
                        return getEmphemeralToken();
                    })
                    .then((ephemeralToken: string) => {
                        console.log('[WebRTC] Connecting with SDP');
                        return connectUsingSDP(ephemeralToken, rtcOffer);
                    })
                    .then((response: Response) => {
                        console.log('[WebRTC] SDP response status:', response.status);
                        if (!response.ok) {
                            throw new Error(`Failed to connect to OpenAI Realtime: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then((answer: string) => {
                        console.log('[WebRTC] Setting remote description');
                        peerConnection.setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp: answer})).then(() => {
                            console.log('[WebRTC] Connection established successfully');
                            resolve({peerConnection, dataChannel});
                        });
                    })
                    .catch((error: Error) => {
                        console.error('[WebRTC] Connection error:', error);
                        if (audioMonitor) {
                            audioMonitor.stop();
                        }
                        stopConnection();
                        reject(error);
                    });
            });
        });
}

// Simplified transcript handling - just collect it for debugging
function handleTranscriptDelta(text: string) {
    // Append to the current transcript
    currentTranscript += text;
    
    // Log transcript updates infrequently to avoid spamming
    if (WEBRTC_DEBUG.verbose) {
        console.log(`[WebRTC] Transcript update: "${text}"`);
    }
}

// Update message handling to handle transcript deltas without UI updates
function handleOpenAIMessage(message: OpenAIRealtimeMessage) {
    console.log('[WebRTC] Handling message type:', message.type);
    
    switch (message.type) {
        case 'response.function_call_arguments.done':
            console.log('[WebRTC] Function call received:', message.name);
            handleFunctionCall(message);
            break;
        case 'response.audio_transcript.delta':
            // Handle transcript delta messages
            if (message.delta?.text) {
                handleTranscriptDelta(message.delta.text);
            }
            break;
        case 'error':
            console.error('[WebRTC] OpenAI error', message);
            break;
        default:
            // Reduce the noise by only logging unhandled message types in verbose mode
            if (WEBRTC_DEBUG.verbose) {
                console.log(`[WebRTC] Unhandled message type: ${message.type}`);
            }
    }
}

// Update initializeOpenAIRealtime to remove UI feedback
function initializeOpenAIRealtime(adminsReportID: number) {
    console.log('[WebRTC] Initializing OpenAI realtime with adminsReportID:', adminsReportID);
    currentAdminsReportID = adminsReportID;
    currentTranscript = ''; // Reset transcript

    // Set initial state - remove UI-related properties
    Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {
        isLoading: true,
    });

    connectToOpenAIRealtime()
        .then((connection: ConnectionResult) => {
            console.log('[WebRTC] Connection established, setting up handlers');
            connections.openai = connection;
            Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {
                isTalkingToAISales: true,
                isLoading: false,
            });

            connections.openai.dataChannel.onopen = () => {
                console.log('[WebRTC] Data channel opened, sending initial message');
                if (!connections.openai) {
                    console.warn('[WebRTC] Connection lost before data channel could be used');
                    return;
                }

                const initialUserMessage = {
                    type: 'response.create',
                    response: {
                        instructions: 'Greet the user.',
                    },
                };

                connections.openai.dataChannel.send(JSON.stringify(initialUserMessage));
                console.log('[WebRTC] Initial message sent');
            };

            connections.openai.dataChannel.onmessage = (event: MessageEvent) => {
                console.log('[WebRTC] Message received from OpenAI');
                const message: OpenAIRealtimeMessage = JSON.parse(event.data as string) as OpenAIRealtimeMessage;
                console.log('[WebRTC] Parsed message:', {
                    type: message.type,
                    name: message.name
                });
                handleOpenAIMessage(message);
            };
        })
        .catch((error) => {
            console.error('[WebRTC] Failed to connect:', error);
            stopConnection();
            Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {
                isLoading: false,
            });
        });

    // Remove microphone activity check
}

function handleFunctionCall(message: OpenAIRealtimeMessage) {
    console.log('[WebRTC] Processing function call:', message.name);
    
    if (message.name === 'EndCall') {
        console.log('[WebRTC] EndCall function triggered');
        stopConnection();
        return;
    }

    if (message.name === 'SendRecapInAdminsRoom') {
        console.log('[WebRTC] SendRecapInAdminsRoom function triggered');
        try {
            const parsedArguments: Recap = JSON.parse(message.arguments) as Recap;
            if (!parsedArguments.recap) {
                console.warn('[WebRTC] Recap is empty, ending connection');
                stopConnection();
                return;
            }

            console.log('[WebRTC] Sending recap to admins room:', currentAdminsReportID);
            const params: SendRecapInAdminsRoomParams = {
                reportID: currentAdminsReportID ?? CONST.DEFAULT_NUMBER_ID,
                recap: parsedArguments.recap,
            };

            API.write(WRITE_COMMANDS.SEND_RECAP_IN_ADMINS_ROOM, params);
            console.log('[WebRTC] Recap sent, ending connection');
            stopConnection();
        } catch (e) {
            console.error('[WebRTC] Error parsing recap arguments:', e);
            stopConnection();
        }
    }
}

// Update the stopConnection function to remove UI feedback cleanup
function stopConnection() {
    console.log('[WebRTC] Stopping connection');

    // Stop audio monitoring if active
    if (audioMonitor) {
        audioMonitor.stop();
        audioMonitor = null;
    }

    if (mediaStream) {
        console.log('[WebRTC] Stopping media stream tracks');
        mediaStream.getTracks().forEach((track) => {
            console.log(`[WebRTC] Stopping track: ${track.label}, kind: ${track.kind}`);
            track.stop();
        });
        mediaStream = null;
    }

    const existingConnection = connections.openai;
    if (!existingConnection) {
        console.log('[WebRTC] No existing connection to close');
        return;
    }

    if (existingConnection.dataChannel) {
        console.log(`[WebRTC] Data channel state: ${existingConnection.dataChannel.readyState}`);
        if (existingConnection.dataChannel.readyState === 'open') {
            console.log('[WebRTC] Closing data channel');
            existingConnection.dataChannel.close();
        }
    }

    if (existingConnection.peerConnection) {
        console.log(`[WebRTC] Peer connection state: ${existingConnection.peerConnection.connectionState}`);
        console.log('[WebRTC] Closing peer connection');
        existingConnection.peerConnection.close();
    }
    
    connections.openai = null;
    console.log('[WebRTC] Connection fully closed');
    
    Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {isTalkingToAISales: false});

    // Remove microphone activity check cleanup
}

export {initializeOpenAIRealtime, stopConnection};
