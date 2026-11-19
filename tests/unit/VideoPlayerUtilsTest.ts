import {buildVideoSourceURL} from '@components/VideoPlayer/utils';

import CONFIG from '@src/CONFIG';

const ENCRYPTED_TOKEN = 'testEncryptedToken123';
const SKIP_TIME_TAG = '#t=0.001';

describe('buildVideoSourceURL', () => {
    it('adds the token and the skip time tag to a video on an Expensify server', () => {
        // Given a chat attachment video on an Expensify server
        const url = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}chat-attachments/123/w_video.mp4`;

        // When building the playable source
        const result = buildVideoSourceURL(url, ENCRYPTED_TOKEN);

        // Then the server gets the token it needs, and playback skips the first millisecond
        expect(result).toBe(`${url}?encryptedAuthToken=${ENCRYPTED_TOKEN}${SKIP_TIME_TAG}`);
    });

    it('adds only the skip time tag to a video outside Expensify', () => {
        // Given a video on a host that is not an Expensify server
        const url = 'https://attacker.example/video.mp4';

        // When building the playable source
        const result = buildVideoSourceURL(url, ENCRYPTED_TOKEN);

        // Then the token stays out of the URL, so that host never sees it
        expect(result).toBe(`${url}${SKIP_TIME_TAG}`);
    });

    it.each([
        ['a blob video', 'blob:https://new.expensify.com/1234-5678'],
        ['a file video', 'file:///data/user/0/video.mp4'],
    ])('adds only the skip time tag to %s on the device', (_, url) => {
        // Given a video the user picked but has not uploaded yet
        // When building the playable source
        const result = buildVideoSourceURL(url, ENCRYPTED_TOKEN);

        // Then the token stays out of the URL, because a local file needs no auth
        expect(result).toBe(`${url}${SKIP_TIME_TAG}`);
    });

    it('returns an empty URL unchanged', () => {
        // Given a video with no URL yet
        // When building the playable source
        const result = buildVideoSourceURL('', ENCRYPTED_TOKEN);

        // Then nothing is added
        expect(result).toBe('');
    });
});
