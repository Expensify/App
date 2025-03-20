import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

function connectToOpenAIRealtime() {
    // const response = await fetch('https://api.openai.com/v1/realtime', {
    //     method: 'POST',
    //     headers: {
    //         Authorization: `Bearer ${ephemeralToken}`,
    //         'Content-Type': 'application/sdp',
    //     },
    //     body: offer.sdp,
    // });
}

function getEmphemeralToken() {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GET_EMPHEMERAL_TOKEN, null).then((response) => {
        try {
            console.log(response);
            return response ? response.data : null;
        } catch (error) {
            console.error(error);
        }
    });
}

function sendRecapInAdminsRoom() {}

// start webrtc connection, stop webrtc connection

export {connectToOpenAIRealtime, getEmphemeralToken, sendRecapInAdminsRoom};
