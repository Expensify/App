import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetEmphemeralTokenParams, SendRecapInAdminsRoomParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {playStreamSound} from '@libs/Sound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TalkToAISales} from '@src/types/onyx';
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
    transcript?: string;
};

type Recap = {
    recap: string;
};

type TranscriptEntry = {
    speaker: string;
    text: string;
};

type CompleteConciergeCallParams = {
    adminsChatReportID: number;
    transcript: string;
};

let currentAdminsReportID: number | null = null;
let mediaStream: MediaStream | null = null;
let clientSecret: TalkToAISales['clientSecret'];
let transcriptArray: TranscriptEntry[] = [];
let currentUserEmail = '';

const connections: WebRTCConnections = {
    openai: null,
};

Onyx.connect({
    key: ONYXKEYS.TALK_TO_AI_SALES,
    callback: (value) => {
        if (!value) {
            return;
        }

        clientSecret = value.clientSecret;
    },
});

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        if (!session?.email) {
            return;
        }

        currentUserEmail = session.email;
    },
});

function isExpiredToken(expiresAt: number): boolean {
    const currentUTCEpochTime = Math.floor(Date.now() / 1000);
    return currentUTCEpochTime >= expiresAt;
}

function getEmphemeralToken(adminsChatReportID: number, ctaUsed: string): Promise<string> {
    if (clientSecret && !isExpiredToken(clientSecret.expiresAt)) {
        Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {
            isLoading: true,
        });
        return Promise.resolve(clientSecret.ephemeralToken);
    }

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
    };

    const parameters: GetEmphemeralTokenParams = {
        adminsChatReportID,
        ctaUsed,
    };

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_EMPHEMERAL_TOKEN, parameters, onyxData)
        .then((response) => {
            Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {
                clientSecret: {
                    ephemeralToken: response?.client_secret?.value ?? '',
                    expiresAt: response?.client_secret?.expires_at ?? 0,
                },
            });

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

function connectToOpenAIRealtime(adminsChatReportID: number, ctaUsed: string): Promise<ConnectionResult> {
    let peerConnection: RTCPeerConnection;
    let rtcOffer: RTCSessionDescriptionInit;
    let dataChannel: RTCDataChannel;

    const constraints = {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 24000,
            sampleSize: 16,
        },
        video: false,
    };

    return new Promise((resolve, reject) => {
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream: MediaStream) => {
                mediaStream = stream;
                const pc = new RTCPeerConnection({
                    iceServers: [
                        {urls: 'stun:stun.l.google.com:19302'},
                        {urls: 'stun:stun1.l.google.com:19302'},
                        {urls: 'stun:stun2.l.google.com:19302'},
                        {urls: 'stun:stun3.l.google.com:19302'},
                        {urls: 'stun:stun4.l.google.com:19302'},
                    ],
                    bundlePolicy: 'max-bundle',
                    rtcpMuxPolicy: 'require',
                    iceCandidatePoolSize: 4,
                });

                const audioTrack = stream.getAudioTracks().at(0);
                if (!audioTrack) {
                    throw new Error('Failed to get audio track');
                }

                pc.addTrack(audioTrack);

                const dc = pc.createDataChannel('openai-control');
                dc.onerror = () => {
                    stopConnection();
                    console.error('Data channel error');
                    reject(new Error('Data channel error'));
                };
                dataChannel = dc;

                // eslint-disable-next-line rulesdir/prefer-early-return
                pc.oniceconnectionstatechange = () => {
                    if (pc.iceConnectionState === 'failed') {
                        stopConnection();
                        console.error('ICE connection failed');
                        reject(new Error('ICE connection failed'));
                    }
                };

                // eslint-disable-next-line rulesdir/prefer-early-return
                pc.ontrack = (event) => {
                    if (event.track.kind === 'audio') {
                        const audioStream = event.streams.at(0);
                        if (!audioStream) {
                            stopConnection();
                            console.error('Failed to get audio stream');
                            reject(new Error('Failed to get audio stream'));
                            return;
                        }
                        playStreamSound(audioStream);
                    }
                };

                peerConnection = pc;
                return peerConnection.createOffer();
            })
            .then((offer: RTCSessionDescriptionInit | undefined) => {
                if (!offer) {
                    throw new Error('failed to create RTC offer');
                }

                peerConnection.setLocalDescription(offer);
                rtcOffer = offer;
            })
            .then(() => {
                return getEmphemeralToken(adminsChatReportID, ctaUsed);
            })
            .then((ephemeralToken: string) => {
                return connectUsingSDP(ephemeralToken, rtcOffer);
            })
            .then((response: Response) => {
                if (!response.ok) {
                    throw new Error('Failed to connect to OpenAI Realtime');
                }
                return response.text();
            })
            .then((answer: string) => {
                peerConnection.setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp: answer})).then(() => {
                    resolve({peerConnection, dataChannel});
                });
            })
            .catch((error: Error) => {
                console.error(error);
                stopConnection();
                reject(error);
            })
            .finally(() => {
                Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {isLoading: false});
            });
    });
}

function handleOpenAIMessage(message: OpenAIRealtimeMessage) {
    switch (message.type) {
        case 'response.function_call_arguments.done':
            handleFunctionCall(message);
            break;
        case 'response.audio_transcript.done':
            handleTranscriptMessage(CONST.EMAIL.CONCIERGE, message);
            break;
        case 'conversation.item.input_audio_transcription.completed':
            handleTranscriptMessage(currentUserEmail, message);
            break;
        case 'error':
            console.error('[WebRTC] OpenAI error', {message});
            break;
        default:
    }
}

function completeConciergeCall() {
    if (!currentAdminsReportID || transcriptArray.length === 0) {
        return;
    }

    const params: CompleteConciergeCallParams = {
        adminsChatReportID: currentAdminsReportID,
        transcript: JSON.stringify(transcriptArray),
    };

    API.write(WRITE_COMMANDS.COMPLETE_CONCIERGE_CALL, params);
}

function initializeOpenAIRealtime(adminsReportID: number, ctaUsed: string) {
    if (adminsReportID === CONST.DEFAULT_NUMBER_ID || ctaUsed === '') {
        return;
    }

    currentAdminsReportID = adminsReportID;
    transcriptArray = [];

    connectToOpenAIRealtime(adminsReportID, ctaUsed)
        .then((connection: ConnectionResult) => {
            connections.openai = connection;
            Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {isTalkingToAISales: true});

            connections.openai.dataChannel.onopen = () => {
                if (!connections.openai) {
                    return;
                }

                const sessionUpdate = {
                    type: 'session.update',
                    session: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        input_audio_transcription: {
                            model: 'whisper-1',
                        },
                    },
                };
                connections.openai.dataChannel.send(JSON.stringify(sessionUpdate));

                const initialUserMessage = {
                    type: 'response.create',
                    response: {
                        instructions: 'Greet the user.',
                    },
                };

                connections.openai.dataChannel.send(JSON.stringify(initialUserMessage));
            };

            connections.openai.dataChannel.onmessage = (event: MessageEvent) => {
                const message: OpenAIRealtimeMessage = JSON.parse(event.data as string) as OpenAIRealtimeMessage;
                handleOpenAIMessage(message);
            };
        })
        .catch((error) => {
            stopConnection();
            console.error(error);
        });
}

function handleFunctionCall(message: OpenAIRealtimeMessage) {
    if (message.name === CONST.OPEN_AI_TOOL_NAMES.END_CALL) {
        stopConnection();
        return;
    }

    if (message.name === CONST.OPEN_AI_TOOL_NAMES.SEND_RECAP_IN_ADMINS_ROOM) {
        const parsedArguments: Recap = JSON.parse(message.arguments) as Recap;
        if (!parsedArguments.recap) {
            stopConnection();
            return;
        }

        const params: SendRecapInAdminsRoomParams = {
            reportID: currentAdminsReportID ?? CONST.DEFAULT_NUMBER_ID,
            recap: parsedArguments.recap,
        };

        API.write(WRITE_COMMANDS.SEND_RECAP_IN_ADMINS_ROOM, params);
        stopConnection();
    }
}

function handleTranscriptMessage(email: string, message: OpenAIRealtimeMessage) {
    if (!message.transcript?.trim()) {
        return;
    }

    transcriptArray.push({
        speaker: email,
        text: message.transcript.trim(),
    });
}

function stopConnection() {
    Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {isTalkingToAISales: false});

    completeConciergeCall();

    if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
            track.stop();
        });
        mediaStream = null;
    }

    const existingConnection = connections.openai;
    if (!existingConnection) {
        return;
    }

    if (existingConnection.dataChannel.readyState === 'open') {
        existingConnection.dataChannel.close();
    }

    existingConnection.peerConnection.close();
    connections.openai = null;
}

export {initializeOpenAIRealtime, stopConnection};
