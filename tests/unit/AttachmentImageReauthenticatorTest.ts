import {isImageAuthenticationRequired, reauthenticateAttachmentImages} from '@libs/actions/Session/AttachmentImageReauthenticator';
import {getIsOffline} from '@libs/NetworkState';
import reauthenticate from '@libs/Reauthentication';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

import createMock from '../utils/createMock';

jest.mock('@libs/NetworkState', () => ({getIsOffline: jest.fn()}));
jest.mock('@libs/Reauthentication', () => jest.fn());

const originalFetch = globalThis.fetch;
const mockFetch = jest.fn<ReturnType<typeof fetch>, [input: Parameters<typeof fetch>[0] | URL, init?: Parameters<typeof fetch>[1]]>();
const IMAGE_URL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/image.jpg`;

describe('AttachmentImageReauthenticator', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockFetch.mockReset();
        globalThis.fetch = mockFetch;
        jest.mocked(getIsOffline).mockReturnValue(false);
        jest.mocked(reauthenticate).mockResolvedValue({wasSuccessful: true});
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('shares one authentication attempt across simultaneous image errors', async () => {
        // Given multiple images that fail before authentication finishes
        // When each asks to use the existing authentication flow
        const first = reauthenticateAttachmentImages();
        const second = reauthenticateAttachmentImages();

        // Then the shared promise prevents competing sign-in attempts
        expect(first).toBe(second);
        expect(await first).toEqual({wasSuccessful: true});
        expect(reauthenticate).toHaveBeenCalledTimes(1);
    });

    it('skips authentication while offline', async () => {
        // Given a device that cannot complete a sign-in request
        jest.mocked(getIsOffline).mockReturnValue(true);

        // When image recovery asks to authenticate
        const result = await reauthenticateAttachmentImages();

        // Then offline image failures do not initiate authentication
        expect(result).toEqual({wasSuccessful: false});
        expect(reauthenticate).not.toHaveBeenCalled();
    });

    it('returns the existing SAML redirect result without trying another API', async () => {
        // Given the existing SAML flow that starts an IdP redirect instead of returning new credentials
        jest.mocked(reauthenticate).mockResolvedValueOnce({wasSuccessful: false});

        // When image recovery delegates to that flow
        const result = await reauthenticateAttachmentImages();

        // Then its navigation outcome remains unchanged
        expect(result).toEqual({wasSuccessful: false});
        expect(reauthenticate).toHaveBeenCalledTimes(1);
    });

    it('releases a rejected request so a later image can attempt authentication', async () => {
        // Given an authentication request that fails at the transport layer
        jest.mocked(reauthenticate).mockRejectedValueOnce(new Error('Network unavailable'));

        // When the caller observes the failure and later tries again
        await expect(reauthenticateAttachmentImages()).rejects.toThrow('Network unavailable');
        await reauthenticateAttachmentImages();

        // Then a rejected promise cannot permanently block future image recovery
        expect(reauthenticate).toHaveBeenCalledTimes(2);
    });
    it.each([401, 200, 206, 302, 403, 404, 405, 429, 500])('classifies HTTP status %s using an authenticated HEAD request', async (status) => {
        // Given an image endpoint whose HTTP status can be checked without reading its body
        mockFetch.mockResolvedValueOnce(createMock<Response>({status}));

        // When an authenticated image load needs its failure classified
        const requiresAuthentication = await isImageAuthenticationRequired(IMAGE_URL, 'image-token');

        // Then only unauthorized responses can trigger SAML authentication
        expect(requiresAuthentication).toBe(status === 401);
        expect(mockFetch).toHaveBeenCalledWith(
            IMAGE_URL,
            expect.objectContaining({
                method: 'HEAD',
                headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: 'image-token'},
            }),
        );
        expect(mockFetch.mock.calls.at(0)?.[1]?.signal).toBeInstanceOf(AbortSignal);
        expect(jest.getTimerCount()).toBe(0);
    });

    it('does not send image credentials to an untrusted probe URL', async () => {
        // Given a URL outside the trusted attachment hosts
        // When an authentication probe is requested
        const requiresAuthentication = await isImageAuthenticationRequired('https://attacker.example/image.jpg', 'image-token');

        // Then the token cannot leak through the status probe
        expect(requiresAuthentication).toBe(false);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('does not probe while offline', async () => {
        // Given an unavailable network rather than an authentication decision
        jest.mocked(getIsOffline).mockReturnValue(true);

        // When an image error requests a status check
        const requiresAuthentication = await isImageAuthenticationRequired(IMAGE_URL, 'image-token');

        // Then offline failures cannot be classified as expired authentication
        expect(requiresAuthentication).toBe(false);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('propagates a failed probe and clears its timeout', async () => {
        // Given a transport failure rather than an HTTP response
        mockFetch.mockRejectedValueOnce(new Error('Network unavailable'));

        // When the status probe cannot reach the server
        await expect(isImageAuthenticationRequired(IMAGE_URL, 'image-token')).rejects.toThrow('Network unavailable');

        // Then the caller can use normal image error handling without a lingering timer
        expect(jest.getTimerCount()).toBe(0);
        expect(reauthenticate).not.toHaveBeenCalled();
    });

    it('aborts a stalled probe instead of leaving image recovery pending indefinitely', async () => {
        // Given a request that does not produce a response
        mockFetch.mockImplementationOnce(
            (...parameters) =>
                new Promise<Response>((resolve, reject) => {
                    parameters[1]?.signal?.addEventListener('abort', () => reject(new Error('Probe aborted')));
                }),
        );
        const probe = isImageAuthenticationRequired(IMAGE_URL, 'image-token');
        const rejection = expect(probe).rejects.toThrow('Probe aborted');

        // When the image-load timeout elapses
        await jest.advanceTimersByTimeAsync(CONST.TIMING.IMAGE_LOAD_STALL_TIMEOUT);
        await rejection;

        // Then a stalled connection cannot turn into authentication or an endless image spinner
        expect(reauthenticate).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
    });
});
