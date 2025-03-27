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
let audioQualityMonitor: { stop: () => void } | null = null;
let audioMonitor: { stop: () => void } | null = null;

const connections: WebRTCConnections = {
    openai: null,
};

// Add a debug configuration object at the top of the file
const WEBRTC_DEBUG = {
    verbose: true, // Set to true in development for verbose logging
    audioLevels: true, // Set to true to log microphone levels
    silenceWarningInterval: 10000, // Only warn about silence every 10 seconds
};

// Add this flag at the top level
let useCompatibilityMode = false;

// Add this function to toggle compatibility mode
function enableCompatibilityMode(enable = true) {
    useCompatibilityMode = enable;
    console.log(`[WebRTC] Compatibility mode ${enable ? 'enabled' : 'disabled'}`);
    return `WebRTC compatibility mode ${enable ? 'enabled' : 'disabled'}`;
}

// Expose this to the console
window.enableWebRTCCompatibilityMode = enableCompatibilityMode;

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
    let connectionPhase = 'starting'; // Track where we are in the connection process
    let peerConnection: RTCPeerConnection;
    let rtcOffer: RTCSessionDescriptionInit;
    let dataChannel: RTCDataChannel;

    console.log('[WebRTC] Starting OpenAI connection...');
    
    return new Promise<ConnectionResult>((resolve, reject) => {
        // Step 1: Check if getUserMedia is supported
        if (!mediaDevices || !mediaDevices.getUserMedia) {
            console.error('[WebRTC] getUserMedia not supported');
            reject(new Error('getUserMedia not supported in this browser'));
            return;
        }
        
        connectionPhase = 'requesting_media';
        console.log('[WebRTC] Requesting user media');
        
        // First, enumerate devices to check for available microphones
        mediaDevices.enumerateDevices()
            .then(devices => {
                const audioInputs = devices.filter(device => device.kind === 'audioinput');
                console.log('[WebRTC] Available audio inputs:', audioInputs.length);
                
                if (audioInputs.length === 0) {
                    throw new Error('No audio input devices found');
                }
                
                // Log the labels of available devices (requires permission)
                audioInputs.forEach((device, index) => {
                    console.log(`[WebRTC] Audio device ${index}: ${device.label || 'Label not available (no permission)'}`);
                });
                
                // Use simpler constraints when in compatibility mode
                const audioConstraints = {
                    audio: useCompatibilityMode ? true : {
                        // Your enhanced settings here
                    }
                };
                
                return mediaDevices.getUserMedia(audioConstraints);
            })
            .then((stream: MediaStream) => {
                connectionPhase = 'media_obtained';
                console.log('[WebRTC] Got user media stream');
                
                const audioTracks = stream.getAudioTracks();
                console.log(`[WebRTC] Audio tracks obtained: ${audioTracks.length}`);
                
                if (audioTracks.length === 0) {
                    throw new Error('No audio tracks in media stream');
                }
                
                // Log the settings of the audio track
                const settings = audioTracks[0].getSettings();
                console.log('[WebRTC] Audio track settings:', settings);
                
                mediaStream = stream;
                
                // Setup audio monitoring
                audioMonitor = setupAudioLevelMonitoring(stream);
                
                // Create peer connection
                connectionPhase = 'creating_peer_connection';
                console.log('[WebRTC] Creating peer connection');
                
                try {
                    // Use simpler peer connection config in compatibility mode
                    const pcConfig = useCompatibilityMode ? {
                        iceServers: []
                    } : {
                        // Your enhanced settings here
                    };
                    
                    peerConnection = new RTCPeerConnection(pcConfig);
                    
                    // Detailed connection event logging
                    peerConnection.onconnectionstatechange = () => {
                        console.log(`[WebRTC] Connection state changed: ${peerConnection.connectionState}`);
                    };
                    
                    peerConnection.onsignalingstatechange = () => {
                        console.log(`[WebRTC] Signaling state changed: ${peerConnection.signalingState}`);
                    };
                    
                    peerConnection.onicegatheringstatechange = () => {
                        console.log(`[WebRTC] ICE gathering state: ${peerConnection.iceGatheringState}`);
                    };
                    
                    peerConnection.oniceconnectionstatechange = () => {
                        console.log(`[WebRTC] ICE connection state: ${peerConnection.iceConnectionState}`);
                        
                        if (peerConnection.iceConnectionState === 'failed') {
                            console.error('[WebRTC] ICE connection failed');
                            reject(new Error('ICE connection failed - likely a network NAT/firewall issue'));
                            stopConnection();
                        }
                    };
                    
                    peerConnection.onicecandidateerror = (event) => {
                        console.error(`[WebRTC] ICE candidate error: ${event.errorText} (code: ${event.errorCode})`);
                    };
                } catch (e) {
                    console.error('[WebRTC] Error creating peer connection:', e);
                    throw new Error(`Failed to create peer connection: ${e.message}`);
                }
                
                // Add tracks and create data channel
                try {
                    const audioTrack = stream.getAudioTracks()[0];
                    peerConnection.addTrack(audioTrack);
                    console.log('[WebRTC] Added audio track to peer connection');
                    
                    connectionPhase = 'creating_data_channel';
                    dataChannel = peerConnection.createDataChannel('openai-control');
                    console.log('[WebRTC] Created data channel');
                    
                    dataChannel.onopen = () => {
                        console.log('[WebRTC] Data channel opened');
                    };
                    
                    dataChannel.onerror = (error) => {
                        console.error('[WebRTC] Data channel error:', error);
                        // Don't reject here, as this might happen after connection success
                    };
                } catch (e) {
                    console.error('[WebRTC] Error setting up tracks/data channel:', e);
                    throw new Error(`Failed to setup tracks or data channel: ${e.message}`);
                }
                
                // Setup track event handler
                peerConnection.ontrack = (event) => {
                    console.log('[WebRTC] Track received:', event.track.kind);
                    if (event.track.kind === 'audio') {
                        const audioStream = event.streams[0];
                        if (!audioStream) {
                            console.error('[WebRTC] Failed to get stream from track event');
                            return;
                        }
                        console.log('[WebRTC] Playing audio stream');
                        playStreamSound(audioStream);
                    }
                };
                
                // Create offer
                connectionPhase = 'creating_offer';
                console.log('[WebRTC] Creating offer');
                return peerConnection.createOffer();
            })
            .then((offer: RTCSessionDescriptionInit) => {
                console.log('[WebRTC] Setting local description');
                connectionPhase = 'setting_local_description';
                
                // Skip SDP modifications in compatibility mode
                if (!useCompatibilityMode && offer.sdp) {
                    // Your SDP modifications here
                }
                
                return peerConnection.setLocalDescription(offer)
                    .then(() => {
                        rtcOffer = offer;
                        console.log('[WebRTC] Local description set successfully');
                    });
            })
            .then(() => {
                console.log('[WebRTC] Getting ephemeral token');
                connectionPhase = 'getting_token';
                return getEmphemeralToken();
            })
            .then((ephemeralToken: string) => {
                if (!ephemeralToken) {
                    throw new Error('Failed to get ephemeral token');
                }
                
                console.log('[WebRTC] Connecting with SDP');
                connectionPhase = 'connecting_sdp';
                
                // Log the SDP being sent (this is helpful for WebRTC debugging)
                console.log('[WebRTC] SDP Offer (shortened):', 
                    rtcOffer.sdp ? rtcOffer.sdp.substring(0, 100) + '...' : 'No SDP');
                
                return connectUsingSDP(ephemeralToken, rtcOffer);
            })
            .then((response: Response) => {
                console.log('[WebRTC] SDP response status:', response.status);
                connectionPhase = 'sdp_response_received';
                
                if (!response.ok) {
                    // Log detailed response error
                    console.error(`[WebRTC] Failed to connect to OpenAI Realtime: ${response.status} ${response.statusText}`);
                    
                    // Try to get the response body for more details
                    return response.text().then(text => {
                        console.error('[WebRTC] Error response body:', text);
                        throw new Error(`Server rejected connection: ${response.status} ${response.statusText}`);
                    });
                }
                
                return response.text();
            })
            .then((answer: string) => {
                console.log('[WebRTC] Setting remote description');
                connectionPhase = 'setting_remote_description';
                
                if (!answer || answer.length < 10) {
                    throw new Error('Empty or invalid SDP answer received from server');
                }
                
                // Log the SDP answer received (shortened for brevity)
                console.log('[WebRTC] SDP Answer (shortened):', answer.substring(0, 100) + '...');
                
                return peerConnection.setRemoteDescription(new RTCSessionDescription({
                    type: 'answer', 
                    sdp: answer
                }));
            })
            .then(() => {
                console.log('[WebRTC] Connection established successfully');
                connectionPhase = 'connection_established';
                resolve({peerConnection, dataChannel});
            })
            .catch((error: Error) => {
                console.error(`[WebRTC] Connection failed during ${connectionPhase} phase:`, error);
                
                // Collect detailed diagnostic information
                const diagnosticInfo = {
                    error: error.message,
                    phase: connectionPhase,
                    userAgent: navigator.userAgent,
                    time: new Date().toISOString(),
                    peerConnectionState: peerConnection ? {
                        connectionState: peerConnection.connectionState,
                        iceConnectionState: peerConnection.iceConnectionState,
                        signalingState: peerConnection.signalingState,
                        iceGatheringState: peerConnection.iceGatheringState
                    } : 'Not created'
                };
                
                console.error('[WebRTC] Diagnostic information:', diagnosticInfo);
                
                stopConnection();
                reject(error);
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


function initializeOpenAIRealtime(adminsReportID: number) {
    console.log('[WebRTC] Initializing OpenAI realtime with adminsReportID:', adminsReportID);
    currentAdminsReportID = adminsReportID;
    currentTranscript = ''; // Reset transcript

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

    // Stop audio quality monitoring
    if (audioQualityMonitor) {
        audioQualityMonitor.stop();
        audioQualityMonitor = null;
    }

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
}

// Add this new function
function monitorAudioQuality(peerConnection: RTCPeerConnection) {
    // Check if the browser supports statistics
    if (!peerConnection.getStats) {
        console.log('[WebRTC] Stats API not supported in this browser');
        return { stop: () => {} };
    }

    const statsInterval = setInterval(() => {
        peerConnection.getStats().then((stats) => {
            stats.forEach((report) => {
                if (report.type === 'inbound-rtp' && report.kind === 'audio') {
                    console.log('[WebRTC] Audio Quality Stats:', {
                        packetsReceived: report.packetsReceived,
                        packetsLost: report.packetsLost,
                        jitter: report.jitter,
                        codecName: report.codecId,
                        audioLevel: report.audioLevel
                    });
                    
                    // Calculate packet loss percentage
                    if (report.packetsReceived > 0) {
                        const lossRate = (report.packetsLost || 0) / 
                            (report.packetsReceived + (report.packetsLost || 0));
                        
                        if (lossRate > 0.05) { // More than 5% packet loss
                            console.warn(`[WebRTC] High audio packet loss: ${(lossRate * 100).toFixed(2)}%`);
                        }
                    }
                }
            });
        });
    }, 10000); // Check every 10 seconds
    
    return {
        stop: () => {
            clearInterval(statsInterval);
        }
    };
}

// Add this function to collect debug information
function collectDebugInfo() {
    const debugInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt
        } : 'Not available',
        webRTC: {
            connectionState: connections.openai?.peerConnection.connectionState || 'Not connected',
            iceConnectionState: connections.openai?.peerConnection.iceConnectionState || 'Not connected',
            signalingState: connections.openai?.peerConnection.signalingState || 'Not connected',
            iceGatheringState: connections.openai?.peerConnection.iceGatheringState || 'Not connected',
            dataChannelState: connections.openai?.dataChannel.readyState || 'Not connected'
        },
        audioTracks: mediaStream ? mediaStream.getAudioTracks().map(track => ({
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
        })) : 'No media stream'
    };
    
    console.log('[WebRTC] Debug info:', debugInfo);
    return debugInfo;
}

// Add a button or command that users can trigger to collect debug info
function exportDebugInfo() {
    const debugInfo = collectDebugInfo();
    
    // Create a downloadable file with the debug info
    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `webrtc-debug-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return 'Debug info exported';
}

// Expose this function to the console for easy access
window.exportWebRTCDebug = exportDebugInfo;

// Add this function to test basic connectivity
async function testOpenAIConnectivity() {
    console.log('[WebRTC] Testing connectivity to OpenAI services...');
    
    try {
        // Test if we can reach OpenAI API (not the realtime endpoint)
        const apiResponse = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            mode: 'no-cors' // Just checking connectivity, not actual API response
        });
        console.log('[WebRTC] OpenAI API connectivity check complete');
        
        // Test basic WebRTC device access
        const devicePermissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log('[WebRTC] Microphone permission status:', devicePermissions.state);
        
        // Test WebRTC support
        const rtcSupport = {
            RTCPeerConnection: !!window.RTCPeerConnection,
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            mediaDevices: !!navigator.mediaDevices,
            AudioContext: !!(window.AudioContext || window.webkitAudioContext)
        };
        console.log('[WebRTC] WebRTC support check:', rtcSupport);
        
        return {
            openaiConnectivity: true,
            microphonePermission: devicePermissions.state,
            webrtcSupport: rtcSupport,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('[WebRTC] Connectivity test failed:', error);
        return {
            openaiConnectivity: false,
            error: error.message,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }
}

// Expose this to the console for easy testing
window.testOpenAIConnectivity = testOpenAIConnectivity;

export {initializeOpenAIRealtime, stopConnection};
