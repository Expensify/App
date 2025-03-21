/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import type {MediaStream} from 'react-native-webrtc-web-shim';
import {mediaDevices} from 'react-native-webrtc-web-shim';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import {playStreamSound} from '@libs/Sound';

type ConnectionResult = {
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
};

function getEmphemeralToken(): Promise<string> {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    const token = API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_EMPHEMERAL_TOKEN, {})
        .then((response) => {
            return response?.client_secret?.value ?? '';
        })
        .catch((error) => {
            console.error(error);
            return '';
        });
    return token;
}

function connectToOpenAIRealtime(): Promise<ConnectionResult> {
    let peerConnection: RTCPeerConnection;
    let rtcOffer: RTCSessionDescriptionInit;

    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        mediaDevices
            .getUserMedia({audio: true})
            .then((stream: MediaStream) => {
                const pc = new RTCPeerConnection({
                    iceServers: [],
                });

                const audioTrack = stream.getAudioTracks().at(0);
                if (!audioTrack) {
                    reject(new Error('Failed to get audio track'));
                    return;
                }

                pc.addTrack(audioTrack);

                // eslint-disable-next-line rulesdir/prefer-early-return
                pc.oniceconnectionstatechange = () => {
                    if (pc.iceConnectionState === 'failed') {
                        reject(new Error('ICE connection failed'));
                    }
                };

                // eslint-disable-next-line rulesdir/prefer-early-return
                pc.ontrack = (event) => {
                    if (event.track.kind === 'audio') {
                        const audioStream = event.streams.at(0);
                        if (!audioStream) {
                            reject(new Error('Failed to get stream'));
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
                return fetch('https://api.openai.com/v1/realtime', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${ephemeralToken}`,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'Content-Type': 'application/sdp',
                    },
                    body: rtcOffer.sdp,
                });
            })
            .then((response: Response) => {
                if (!response.ok) {
                    throw new Error('Failed to connect to OpenAI Realtime');
                }
                return response.text();
            })
            .then((answer: string) => {
                peerConnection.setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp: answer}));
                const dataChannel = peerConnection.createDataChannel('openai-control');

                dataChannel.onerror = (event: RTCErrorEvent) => {
                    reject(new Error(`Data channel error: ${event.error.message}`));
                };

                resolve({peerConnection, dataChannel});
            })
            .catch((error: Error) => {
                console.error(error);
                reject(error);
            });
    });
}

export {connectToOpenAIRealtime, getEmphemeralToken};
