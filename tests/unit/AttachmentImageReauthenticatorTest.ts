import reauthenticateAttachmentImages from '@libs/actions/Session/AttachmentImageReauthenticator';
import * as API from '@libs/API';
import {getEncryptedAuthToken} from '@libs/Network/NetworkStore';
import {getIsOffline} from '@libs/NetworkState';

import CONFIG from '@src/CONFIG';

jest.mock('@libs/API', () => ({makeHeadRequest: jest.fn()}));
jest.mock('@libs/Network/NetworkStore', () => ({getEncryptedAuthToken: jest.fn()}));
jest.mock('@libs/NetworkState', () => ({getIsOffline: jest.fn()}));

const makeRequest = jest.mocked(API.makeHeadRequest);
const IMAGE_URL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/image.jpg`;

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getIsOffline).mockReturnValue(false);
    jest.mocked(getEncryptedAuthToken).mockReturnValue('new-token');
    makeRequest.mockResolvedValue(200);
});

describe('AttachmentImageReauthenticator', () => {
    it.each([
        [200, 'new-token', true],
        [200, 'old-token', false],
        [200, null, false],
        [401, 'new-token', false],
        [undefined, 'new-token', false],
    ] as const)('requires a successful probe and replacement credentials: status=%s, token=%s', async (status, token, wasSuccessful) => {
        // Given a probe result that may lack accepted replacement credentials
        makeRequest.mockResolvedValueOnce(status);
        jest.mocked(getEncryptedAuthToken).mockReturnValue(token);
        const controller = new AbortController();

        // When the image delegates its cancellable HEAD request to the API pipeline
        const result = await reauthenticateAttachmentImages(IMAGE_URL, 'old-token', controller.signal);

        // Then only a successful response with a new token permits an image retry
        expect(result).toEqual({wasSuccessful});
        expect(makeRequest).toHaveBeenCalledWith(IMAGE_URL, {signal: controller.signal});
    });

    it.each(['offline', 'untrusted', 'cancelled'])('skips recovery when %s', async (reason) => {
        // Given a request that cannot establish a trusted server authentication decision
        jest.mocked(getIsOffline).mockReturnValue(reason === 'offline');
        const controller = new AbortController();
        if (reason === 'cancelled') {
            controller.abort();
        }
        const url = reason === 'untrusted' ? 'https://attacker.example/image.jpg' : IMAGE_URL;

        // When the image asks to recover
        const result = await reauthenticateAttachmentImages(url, 'old-token', controller.signal);

        // Then no credentials are sent and the caller can end loading
        expect(makeRequest).not.toHaveBeenCalled();
        expect(result).toEqual({wasSuccessful: false});
    });
});
