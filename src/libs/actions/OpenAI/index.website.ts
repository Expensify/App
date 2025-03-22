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
};

type Recap = {
    recap: string;
};

let currentAdminsReportID: number | null = null;
let mediaStream: MediaStream | null = null;

const connections: WebRTCConnections = {
    openai: null,
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

function connectToOpenAIRealtime(): Promise<ConnectionResult> {
    let peerConnection: RTCPeerConnection;
    let rtcOffer: RTCSessionDescriptionInit;
    let dataChannel: RTCDataChannel;

    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        mediaDevices
            .getUserMedia({audio: true})
            .then((stream: MediaStream) => {
                mediaStream = stream;
                const pc = new RTCPeerConnection({
                    iceServers: [],
                });

                const audioTrack = stream.getAudioTracks().at(0);
                if (!audioTrack) {
                    reject(new Error('Failed to get audio track'));
                    return;
                }

                pc.addTrack(audioTrack);

                const dc = pc.createDataChannel('openai-control');
                dc.onerror = () => {
                    reject(new Error(`Data channel error`));
                };
                dataChannel = dc;

                // eslint-disable-next-line rulesdir/prefer-early-return
                pc.oniceconnectionstatechange = () => {
                    if (pc.iceConnectionState === 'failed') {
                        reject(new Error('ICE connection failed'));
                        stopConnection();
                    }
                };

                // eslint-disable-next-line rulesdir/prefer-early-return
                pc.ontrack = (event) => {
                    if (event.track.kind === 'audio') {
                        const audioStream = event.streams.at(0);
                        if (!audioStream) {
                            reject(new Error('Failed to get stream'));
                            stopConnection();
                            return;
                        }
                        playStreamSound(audioStream);
                    }
                };

                peerConnection = pc;
                return peerConnection.createOffer();
            })
            .then((offer: RTCSessionDescriptionInit) => {
                peerConnection.setLocalDescription(offer);
                rtcOffer = offer;
            })
            .then(() => {
                return getEmphemeralToken();
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
            });
    });
}

function handleOpenAIMessage(message: OpenAIRealtimeMessage) {
    switch (message.type) {
        case 'response.function_call_arguments.done':
            handleFunctionCall(message);
            break;
        case 'error':
            console.error('[WebRTC] OpenAI error', {message});
            break;
        default:
    }
}

function initializeOpenAIRealtime(adminsReportID: number) {
    currentAdminsReportID = adminsReportID;

    connectToOpenAIRealtime()
        .then((connection: ConnectionResult) => {
            connections.openai = connection;
            Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {isTalkingToAISales: true});

            connections.openai.dataChannel.onopen = () => {
                if (!connections.openai) {
                    return;
                }

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
    if (message.name === 'EndCall') {
        stopConnection();
        return;
    }

    if (message.name === 'SendRecapInAdminsRoom') {
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

function stopConnection() {
    Onyx.merge(ONYXKEYS.TALK_TO_AI_SALES, {isTalkingToAISales: false});

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
