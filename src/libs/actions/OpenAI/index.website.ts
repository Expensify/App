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

type OpenAIRealtimeMessage = {
    name: string;
    arguments: string;
    type: string;
    delta?: {
        text?: string;
    };
    content?: {
        text?: string;
    };
    responseId?: string;
    itemId?: string;
    eventId?: string;
    response_id?: string;
    item_id?: string;
    output_index?: number;
    content_index?: number;
    transcript?: string;
    part?: {
        type: string;
        text?: string;
        transcript?: string;
    };
};

type Recap = {
    recap: string;
};

// Debug state variables
let isAudioDetected = false;
let audioLevelCheckInterval: ReturnType<typeof setInterval> | null = null;

let currentAdminsReportID: number | null = null;
let mediaStream: MediaStream | null = null;

const connections: WebRTCConnections = {
    openai: null,
};

// Debug logger
function logDebug(type: string, message: string, data?: unknown) {
    console.log(`[OpenAI WebRTC] [${type}] ${message}`, data || '');
}

// Audio level detection
function startAudioLevelMonitoring(stream: MediaStream) {
    if (!stream) {
        logDebug('AUDIO', 'No stream available for audio monitoring');
        return;
    }
    
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        if (audioLevelCheckInterval) {
            clearInterval(audioLevelCheckInterval);
        }
        
        audioLevelCheckInterval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate audio level (simple average)
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            
            const wasAudioDetected = isAudioDetected;
            isAudioDetected = average > 10; // Threshold for audio detection
            
            if (isAudioDetected !== wasAudioDetected) {
                logDebug('AUDIO', `Audio input ${isAudioDetected ? 'detected' : 'stopped'} - Level: ${average.toFixed(2)}`);
            }
        }, 500);
        
        logDebug('AUDIO', 'Audio level monitoring started');
    } catch (error) {
        logDebug('ERROR', 'Failed to initialize audio monitoring', error);
    }
}

function stopAudioLevelMonitoring() {
    if (audioLevelCheckInterval) {
        clearInterval(audioLevelCheckInterval);
        audioLevelCheckInterval = null;
    }
}

function getEmphemeralToken(): Promise<string> {
    logDebug('TOKEN', 'Requesting ephemeral token');
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
            logDebug('TOKEN', 'Ephemeral token received');
            return response?.client_secret?.value ?? '';
        })
        .catch((error) => {
            logDebug('ERROR', 'Failed to get ephemeral token', error);
            return '';
        });
}

function connectUsingSDP(ephemeralToken: string, rtcOffer: RTCSessionDescriptionInit): Promise<Response> {
    logDebug('SDP', 'Sending SDP offer to OpenAI', {
        sdpLength: rtcOffer.sdp?.length || 0,
        sdpPreview: rtcOffer.sdp?.substring(0, 100) + '...'
    });
    
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

function connectToOpenAIRealtime(): Promise<ConnectionResult> {
    let peerConnection: RTCPeerConnection;
    let rtcOffer: RTCSessionDescriptionInit;
    let dataChannel: RTCDataChannel;

    logDebug('CONNECTION', 'Initializing OpenAI realtime connection');

    return new Promise((resolve, reject) => {
        // Use recommended WebRTC settings for OpenAI
        const audioConstraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000, // Higher sample rate for better quality
                channelCount: 1, // Mono
            },
        };

        logDebug('MEDIA', 'Requesting user media with constraints', audioConstraints);
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        mediaDevices
            .getUserMedia(audioConstraints)
            .then((stream: MediaStream) => {
                mediaStream = stream;
                logDebug('MEDIA', 'Media stream obtained', {
                    audioTracks: stream.getAudioTracks().length,
                    trackSettings: stream.getAudioTracks()[0]?.getSettings()
                });
                
                // Start monitoring audio levels
                startAudioLevelMonitoring(stream);
                
                // Configure ICE servers for better connectivity
                const pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' },
                        { urls: 'stun:stun4.l.google.com:19302' },
                    ],
                    // OpenAI realtime optimizations
                    bundlePolicy: 'max-bundle',
                    rtcpMuxPolicy: 'require',
                    iceCandidatePoolSize: 2,
                });

                // Debug WebRTC connection states
                pc.onconnectionstatechange = () => {
                    logDebug('RTC', `Connection state: ${pc.connectionState}`);
                };
                
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        logDebug('ICE', `New ICE candidate: ${event.candidate.candidate.substr(0, 50)}...`);
                    }
                };
                
                pc.onicegatheringstatechange = () => {
                    logDebug('ICE', `ICE gathering state: ${pc.iceGatheringState}`);
                };
                
                pc.onsignalingstatechange = () => {
                    logDebug('RTC', `Signaling state: ${pc.signalingState}`);
                };

                const audioTrack = stream.getAudioTracks().at(0);
                if (!audioTrack) {
                    logDebug('ERROR', 'Failed to get audio track from media stream');
                    reject(new Error('Failed to get audio track'));
                    return;
                }

                logDebug('MEDIA', 'Adding audio track to peer connection', {
                    trackId: audioTrack.id,
                    trackEnabled: audioTrack.enabled,
                    trackMuted: audioTrack.muted,
                });
                
                pc.addTrack(audioTrack, stream);

                const dc = pc.createDataChannel('openai-control', {
                    ordered: true,
                });
                
                dc.onopen = () => {
                    logDebug('DATA', 'Data channel opened');
                };
                
                dc.onclose = () => {
                    logDebug('DATA', 'Data channel closed');
                };
                
                dc.onmessage = (event: MessageEvent) => {
                    try {
                        const rawData = event.data as string;
                        // Log full message for debugging
                        logDebug('RAW', `Raw data: ${rawData.substring(0, 150)}${rawData.length > 150 ? '...' : ''}`);
                        
                        // Parse message data
                        const messageData = JSON.parse(rawData);
                        
                        // Create a properly typed message object that maps all possible field structures
                        const message: OpenAIRealtimeMessage = {
                            // Common fields
                            name: messageData.name,
                            arguments: messageData.arguments,
                            type: messageData.type,
                            
                            // Fields for delta updates
                            delta: messageData.delta,
                            
                            // Fields for content parts
                            content: messageData.content,
                            part: messageData.part,
                            
                            // Various IDs in camelCase for our interface
                            responseId: messageData.response_id,
                            itemId: messageData.item_id,
                            eventId: messageData.event_id,
                            
                            // Keep original snake_case fields that might be used directly
                            response_id: messageData.response_id,
                            item_id: messageData.item_id,
                            output_index: messageData.output_index,
                            content_index: messageData.content_index,
                            
                            // Transcript for conversation items
                            transcript: messageData.transcript
                        };
                        
                        handleOpenAIMessage(message);
                    } catch (error) {
                        logDebug('ERROR', 'Failed to parse message', {
                            error,
                            data: typeof event.data === 'string' ? event.data.substring(0, 100) + '...' : 'non-string data',
                        });
                    }
                };
                
                dc.onerror = (error) => {
                    logDebug('ERROR', `Data channel error: ${error.message || 'Unknown error'}`);
                    reject(new Error(`Data channel error`));
                };
                
                dataChannel = dc;

                // eslint-disable-next-line rulesdir/prefer-early-return
                pc.oniceconnectionstatechange = () => {
                    logDebug('ICE', `ICE connection state: ${pc.iceConnectionState}`);
                    if (pc.iceConnectionState === 'failed') {
                        logDebug('ERROR', 'ICE connection failed');
                        reject(new Error('ICE connection failed'));
                        stopConnection();
                    }
                };

                // eslint-disable-next-line rulesdir/prefer-early-return
                pc.ontrack = (event) => {
                    logDebug('MEDIA', 'Remote track received', {
                        kind: event.track.kind,
                        id: event.track.id,
                        streamId: event.streams[0]?.id || 'No stream ID',
                    });
                    
                    if (event.track.kind === 'audio') {
                        const audioStream = event.streams.at(0);
                        if (!audioStream) {
                            logDebug('ERROR', 'Failed to get stream from track event');
                            reject(new Error('Failed to get stream'));
                            stopConnection();
                            return;
                        }
                        logDebug('AUDIO', 'Playing remote audio stream');
                        playStreamSound(audioStream);
                    }
                };

                peerConnection = pc;
                logDebug('OFFER', 'Creating offer...');
                return peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: false,
                    voiceActivityDetection: true,
                });
            })
            .then((offer: RTCSessionDescriptionInit) => {
                logDebug('OFFER', 'Setting local description');
                return peerConnection.setLocalDescription(offer).then(() => {
                    rtcOffer = peerConnection.localDescription as RTCSessionDescriptionInit;
                    logDebug('OFFER', 'Local description set successfully');
                });
            })
            .then(() => {
                logDebug('TOKEN', 'Getting ephemeral token');
                return getEmphemeralToken();
            })
            .then((ephemeralToken: string) => {
                if (!ephemeralToken) {
                    throw new Error('Empty ephemeral token received');
                }
                logDebug('SDP', 'Connecting using SDP');
                return connectUsingSDP(ephemeralToken, rtcOffer);
            })
            .then((response: Response) => {
                logDebug('SDP', `SDP response status: ${response.status}`);
                if (!response.ok) {
                    throw new Error(`Failed to connect to OpenAI Realtime: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then((answer: string) => {
                logDebug('SDP', 'Setting remote description', {
                    answerLength: answer.length,
                    answerPreview: answer.substring(0, 100) + '...'
                });
                
                return peerConnection.setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp: answer})).then(() => {
                    logDebug('CONNECTION', 'WebRTC connection established successfully');
                    resolve({peerConnection, dataChannel});
                });
            })
            .catch((error: Error) => {
                logDebug('ERROR', `Connection failed: ${error.message}`, error);
                stopConnection();
                reject(error);
            });
    });
}

let accumulatedTranscript = '';
let accumulatedContent = '';

function handleOpenAIMessage(message: OpenAIRealtimeMessage) {
    // Log message type for debugging
    logDebug('MESSAGE', `Received message type: ${message.type}`);
    
    // Process specific message types for debugging
    switch (message.type) {
        case 'response.function_call_arguments.done':
            handleFunctionCall(message);
            break;
            
        case 'input_audio_buffer.speech_started':
            // Reset the accumulated transcript when a new speech segment starts
            accumulatedTranscript = '';
            logDebug('SPEECH', '👂 User speech detected by OpenAI');
            break;
            
        case 'input_audio_buffer.speech_stopped':
            logDebug('SPEECH', '🛑 User speech ended');
            break;
            
        case 'conversation.item.input_audio_transcription.completed':
            // This event provides the complete transcript of what the user said
            if (message.transcript) {
                logDebug('USER_SAID', `🗣️ "${message.transcript}"`);
                accumulatedTranscript = message.transcript;
            }
            break;
            
        case 'output_audio_buffer.started':
            // Reset the accumulated content when OpenAI starts speaking
            accumulatedContent = '';
            logDebug('OUTPUT', '🔊 OpenAI started speaking');
            break;
            
        case 'output_audio_buffer.stopped':
            logDebug('OUTPUT', '🔇 OpenAI stopped speaking');
            if (accumulatedContent) {
                logDebug('AI_RESPONSE', `💬 "${accumulatedContent}"`);
            }
            break;
            
        case 'response.audio_transcript.delta':
            // This shows what the AI is about to say (the transcript of its audio)
            if (message.delta?.text) {
                accumulatedContent += message.delta.text;
                logDebug('AI_TRANSCRIPT', `Delta: "${message.delta.text}"`);
            }
            break;
            
        case 'response.text.delta':
            // This is the AI's text response (may be sent together with audio)
            if (message.delta?.text) {
                accumulatedContent += message.delta.text;
                logDebug('AI_TEXT', `Delta: "${message.delta.text}"`);
            }
            break;
            
        case 'response.content_part.added':
            // Content part was added to the response
            if (message.part?.type === 'text' && message.part.text) {
                logDebug('CONTENT', `New content part: "${message.part.text}"`);
            }
            break;
            
        case 'response.audio.done':
            logDebug('AUDIO', '✓ OpenAI finished processing audio response');
            break;
            
        case 'response.audio_transcript.done':
            logDebug('TRANSCRIPT', '✓ Full transcript completed');
            break;

        case 'response.done':
            // Log the complete response including all output
            logDebug('COMPLETE', '✅ Response completed');
            break;
            
        case 'error':
            logDebug('ERROR', '❌ OpenAI error message', message);
            break;
            
        default:
            // Less verbose logging for other message types
            break;
    }
}

function initializeOpenAIRealtime(adminsReportID: number) {
    logDebug('INIT', `Initializing OpenAI Realtime with adminsReportID: ${adminsReportID}`);
    currentAdminsReportID = adminsReportID;

    connectToOpenAIRealtime()
        .then((connection: ConnectionResult) => {
            connections.openai = connection;
            Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {isTalkingToAISales: true});

            connections.openai.dataChannel.onopen = () => {
                if (!connections.openai) {
                    logDebug('WARNING', 'Data channel opened but connection is null');
                    return;
                }

                logDebug('DATA', 'Sending initial greeting message');
                const initialUserMessage = {
                    type: 'response.create',
                    response: {
                        instructions: 'Greet the user.',
                    },
                };

                connections.openai.dataChannel.send(JSON.stringify(initialUserMessage));
            };

            connections.openai.dataChannel.onmessage = (event: MessageEvent) => {
                try {
                    const rawData = event.data as string;
                    // Log full message for debugging
                    logDebug('RAW', `Raw data: ${rawData.substring(0, 150)}${rawData.length > 150 ? '...' : ''}`);
                    
                    // Parse message data
                    const messageData = JSON.parse(rawData);
                    
                    // Create a properly typed message object that maps all possible field structures
                    const message: OpenAIRealtimeMessage = {
                        // Common fields
                        name: messageData.name,
                        arguments: messageData.arguments,
                        type: messageData.type,
                        
                        // Fields for delta updates
                        delta: messageData.delta,
                        
                        // Fields for content parts
                        content: messageData.content,
                        part: messageData.part,
                        
                        // Various IDs in camelCase for our interface
                        responseId: messageData.response_id,
                        itemId: messageData.item_id,
                        eventId: messageData.event_id,
                        
                        // Keep original snake_case fields that might be used directly
                        response_id: messageData.response_id,
                        item_id: messageData.item_id,
                        output_index: messageData.output_index,
                        content_index: messageData.content_index,
                        
                        // Transcript for conversation items
                        transcript: messageData.transcript
                    };
                    
                    handleOpenAIMessage(message);
                } catch (error) {
                    logDebug('ERROR', 'Failed to parse message', {
                        error,
                        data: typeof event.data === 'string' ? event.data.substring(0, 100) + '...' : 'non-string data',
                    });
                }
            };
        })
        .catch((error) => {
            logDebug('ERROR', 'Failed to initialize OpenAI Realtime', error);
            stopConnection();
            console.error(error);
        });
}

function handleFunctionCall(message: OpenAIRealtimeMessage) {
    logDebug('FUNCTION', `Handling function call: ${message.name}`);
    
    if (message.name === 'EndCall') {
        logDebug('FUNCTION', 'EndCall function called, stopping connection');
        stopConnection();
        return;
    }

    if (message.name === 'SendRecapInAdminsRoom') {
        try {
            const parsedArguments: Recap = JSON.parse(message.arguments) as Recap;
            if (!parsedArguments.recap) {
                logDebug('WARNING', 'SendRecapInAdminsRoom called with empty recap', parsedArguments);
                stopConnection();
                return;
            }

            logDebug('FUNCTION', 'Sending recap to admins room', {
                reportID: currentAdminsReportID,
                recapLength: parsedArguments.recap.length,
            });
            
            const params: SendRecapInAdminsRoomParams = {
                reportID: currentAdminsReportID ?? CONST.DEFAULT_NUMBER_ID,
                recap: parsedArguments.recap,
            };

            API.write(WRITE_COMMANDS.SEND_RECAP_IN_ADMINS_ROOM, params);
            stopConnection();
        } catch (error) {
            logDebug('ERROR', 'Failed to parse SendRecapInAdminsRoom arguments', {
                error,
                arguments: message.arguments,
            });
            stopConnection();
        }
    }
}

function stopConnection() {
    logDebug('CONNECTION', 'Stopping WebRTC connection');
    Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {isTalkingToAISales: false});

    stopAudioLevelMonitoring();

    if (mediaStream) {
        logDebug('MEDIA', 'Stopping all media tracks');
        mediaStream.getTracks().forEach((track) => {
            track.stop();
        });
        mediaStream = null;
    }

    const existingConnection = connections.openai;
    if (!existingConnection) {
        logDebug('CONNECTION', 'No existing connection to stop');
        return;
    }

    if (existingConnection.dataChannel.readyState === 'open') {
        logDebug('DATA', 'Closing data channel');
        existingConnection.dataChannel.close();
    }

    logDebug('CONNECTION', 'Closing peer connection');
    existingConnection.peerConnection.close();
    connections.openai = null;
}

export {initializeOpenAIRealtime, stopConnection};
