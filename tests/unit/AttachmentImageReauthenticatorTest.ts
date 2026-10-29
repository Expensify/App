import reauthenticateAttachmentImages from '@libs/actions/Session/AttachmentImageReauthenticator';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import {getEncryptedAuthToken} from '@libs/Network/NetworkStore';
import {getIsOffline} from '@libs/NetworkState';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

jest.mock('@libs/API', () => ({makeRequestWithSideEffects: jest.fn()}));
jest.mock('@libs/Network/NetworkStore', () => ({getEncryptedAuthToken: jest.fn()}));
jest.mock('@libs/NetworkState', () => ({getIsOffline: jest.fn()}));

const makeRequest = jest.mocked(API.makeRequestWithSideEffects);
const IMAGE_URL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/image.jpg`;

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getIsOffline).mockReturnValue(false);
    jest.mocked(getEncryptedAuthToken).mockReturnValue('new-token');
    makeRequest.mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
});

describe('AttachmentImageReauthenticator', () => {
    it('uses a status-only API HEAD request and forwards cancellation', async () => {
        // Given rejected image credentials whose authentication belongs to the API middleware
        const controller = new AbortController();

        // When the middleware recovers and supplies replacement credentials
        const result = await reauthenticateAttachmentImages(IMAGE_URL, 'old-token', controller.signal);

        // Then recovery uses the existing request path rather than a separate authentication owner
        expect(result).toEqual({wasSuccessful: true});
        expect(makeRequest).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.HEAD_ATTACHMENT, {imageURL: IMAGE_URL}, {}, {signal: controller.signal});
    });

    it('does not retry when the probe succeeds with the same credentials', async () => {
        // Given credentials accepted by the image endpoint, so the image failure has another cause
        jest.mocked(getEncryptedAuthToken).mockReturnValue('old-token');

        // When the HEAD request succeeds without a token update
        const result = await reauthenticateAttachmentImages(IMAGE_URL, 'old-token');

        // Then the caller follows its normal image-error path
        expect(result).toEqual({wasSuccessful: false});
    });

    it.each([undefined, {jsonCode: 403}, {jsonCode: 404}, {jsonCode: 407}, {jsonCode: 500}])('ends recovery for an unsuccessful response: %s', async (response) => {
        // Given a non-authentication failure, an unsuccessful sign-in, or no response
        makeRequest.mockResolvedValueOnce(response);

        // When the image recovery request finishes without usable credentials
        const result = await reauthenticateAttachmentImages(IMAGE_URL, 'old-token');

        // Then the mounted image can end its loading state
        expect(result).toEqual({wasSuccessful: false});
    });

    it('does not consider a missing replacement token successful', async () => {
        // Given a session cleared while recovery was pending
        jest.mocked(getEncryptedAuthToken).mockReturnValue(null);

        // When an earlier request returns success
        const result = await reauthenticateAttachmentImages(IMAGE_URL, 'old-token');

        // Then a missing token cannot keep the image waiting for a retry
        expect(result).toEqual({wasSuccessful: false});
    });

    it('skips recovery while offline', async () => {
        // Given an image that cannot establish a server authentication decision
        jest.mocked(getIsOffline).mockReturnValue(true);

        // When image recovery is requested
        const result = await reauthenticateAttachmentImages(IMAGE_URL, 'old-token');

        // Then an offline image failure does not enter authentication
        expect(result).toEqual({wasSuccessful: false});
        expect(makeRequest).not.toHaveBeenCalled();
    });

    it('does not send credentials to an untrusted URL', async () => {
        // Given a URL outside the attachment hosts
        // When its error asks for authenticated recovery
        const result = await reauthenticateAttachmentImages('https://attacker.example/image.jpg', 'old-token');

        // Then the request cannot expose credentials outside the trusted hosts
        expect(result).toEqual({wasSuccessful: false});
        expect(makeRequest).not.toHaveBeenCalled();
    });

    it('skips a request that is already obsolete', async () => {
        // Given a source or account change that cancelled the original image
        const controller = new AbortController();
        controller.abort();

        // When the obsolete image asks to recover
        const result = await reauthenticateAttachmentImages(IMAGE_URL, 'old-token', controller.signal);

        // Then cancellation prevents another sign-in flow
        expect(result).toEqual({wasSuccessful: false});
        expect(makeRequest).not.toHaveBeenCalled();
    });

    it('propagates an unexpected API failure to normal image error handling', async () => {
        // Given a request that cannot complete its recovery flow
        makeRequest.mockRejectedValueOnce(new Error('Network unavailable'));

        // When the caller awaits recovery
        // Then it can end loading through its existing error callback
        await expect(reauthenticateAttachmentImages(IMAGE_URL, 'old-token')).rejects.toThrow('Network unavailable');
    });
});
