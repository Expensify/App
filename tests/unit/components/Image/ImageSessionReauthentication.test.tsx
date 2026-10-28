import {act, render} from '@testing-library/react-native';

import Image from '@components/Image';
import BaseImage from '@components/Image/BaseImage';
import type {ImageProps} from '@components/Image/types';

import {isImageAuthenticationRequired, reauthenticateAttachmentImages} from '@libs/actions/Session/AttachmentImageReauthenticator';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type Session from '@src/types/onyx/Session';

import React, {createContext} from 'react';

const NOW = new Date('2026-10-28T12:00:00Z');
const SOURCE = {uri: `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/receipt.jpg`};
const OTHER_SOURCE = {uri: `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/other.jpg`};
const SESSION: Session = {accountID: 123, authToken: 'auth-token', encryptedAuthToken: 'encrypted-token', creationDate: NOW.getTime() - CONST.SESSION_EXPIRATION_TIME_MS - 1};
const MockSessionContext = createContext<Session | undefined>(SESSION);
const MockNetworkContext = createContext(false);

jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: () => jest.requireActual<typeof React>('react').useContext(MockSessionContext),
}));
jest.mock('@components/Image/BaseImage', () => jest.fn(() => null));
jest.mock('@components/LoadingIndicator', () => () => null);
jest.mock('@hooks/useNetwork', () => () => ({isOffline: jest.requireActual<typeof React>('react').useContext(MockNetworkContext)}));
jest.mock('@libs/Log', () => ({hmmm: jest.fn()}));
jest.mock('@libs/actions/Session/AttachmentImageReauthenticator', () => ({
    isImageAuthenticationRequired: jest.fn(),
    reauthenticateAttachmentImages: jest.fn(),
}));

type TestImageProps = Partial<ImageProps> & {session?: Session; isOffline?: boolean};

function TestImage({session = SESSION, isOffline = false, source = SOURCE, ...props}: TestImageProps) {
    return (
        <MockSessionContext.Provider value={session}>
            <MockNetworkContext.Provider value={isOffline}>
                {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- The Image wrapper does not expose this native prop. */}
                <Image
                    source={source}
                    isAuthTokenRequired
                    {...props}
                />
            </MockNetworkContext.Provider>
        </MockSessionContext.Provider>
    );
}

function imageProps(uri = SOURCE.uri) {
    return jest.mocked(BaseImage).mock.calls.findLast(([props]) => typeof props.source === 'object' && props.source !== null && 'uri' in props.source && props.source.uri === uri)?.[0];
}

async function failImage() {
    await act(async () => {
        const props = imageProps() ?? jest.mocked(BaseImage).mock.calls.at(-1)?.[0];
        props?.onError?.();
    });
}

describe('Image authentication recovery', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(NOW);
        jest.clearAllMocks();
        jest.mocked(isImageAuthenticationRequired).mockResolvedValue(true);
        jest.mocked(reauthenticateAttachmentImages).mockResolvedValue({wasSuccessful: true});
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it.each([undefined, SESSION.creationDate])('loads an image without preemptive authentication when creationDate is %s', (creationDate) => {
        // Given an account whose client timestamp cannot establish token validity
        // When rendering its first authenticated image
        render(<TestImage session={{...SESSION, creationDate}} />);

        // Then the image server decides validity before any authentication request
        expect(imageProps()?.source).toEqual({...SOURCE, cacheKey: SOURCE.uri, headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: SESSION.encryptedAuthToken}});
        expect(isImageAuthenticationRequired).not.toHaveBeenCalled();
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
    });

    it('confirms an HTTP 401 before starting existing reauthentication', async () => {
        // Given a authenticated image whose loader does not expose the HTTP failure status
        const onError = jest.fn();
        const waitForSession = jest.fn();
        render(
            <TestImage
                onError={onError}
                waitForSession={waitForSession}
            />,
        );
        const originalSource = imageProps()?.source;

        // When loading fails and the authenticated HEAD probe confirms a 401
        await failImage();

        // Then the existing IdP flow starts only after checking the image endpoint
        expect(isImageAuthenticationRequired).toHaveBeenCalledWith(SOURCE.uri, SESSION.encryptedAuthToken);
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(1);
        expect(waitForSession).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
        expect(imageProps()?.source).toBe(originalSource);
    });

    it('retries only the failed authenticated image when session tokens change', async () => {
        // Given two images, only one of which reports an error
        const tree = (session: Session) => (
            <>
                <TestImage session={session} />
                <TestImage
                    session={session}
                    source={OTHER_SOURCE}
                />
            </>
        );
        const {rerender} = render(tree(SESSION));
        const successfulSource = imageProps(OTHER_SOURCE.uri)?.source;
        await failImage();

        // When authentication or another API request restores current image credentials
        rerender(tree({...SESSION, authToken: 'new-auth-token', encryptedAuthToken: 'new-encrypted-token', creationDate: NOW.getTime()}));

        // Then the failed image follows the new token without flickering already successful images
        expect(imageProps()?.source).toEqual({...SOURCE, cacheKey: SOURCE.uri, headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: 'new-encrypted-token'}});
        expect(imageProps(OTHER_SOURCE.uri)?.source).toBe(successfulSource);
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(1);
        const retriedSource = imageProps()?.source;
        rerender(tree({...SESSION, encryptedAuthToken: 'later-token', creationDate: NOW.getTime() + 1000}));
        expect(imageProps()?.source).toBe(retriedSource);
    });

    it('uses current credentials even when web retains an earlier error callback', async () => {
        // Given the callback retained by the web loader before an API session update
        const {rerender} = render(<TestImage />);
        const oldError = imageProps()?.onError;
        const oldSource = imageProps()?.source;
        rerender(<TestImage session={{...SESSION, encryptedAuthToken: 'current-token', creationDate: NOW.getTime()}} />);
        expect(imageProps()?.source).toBe(oldSource);

        // When that older image request invokes its retained callback
        await act(async () => {
            oldError?.();
        });

        // Then current credentials are reused without an unnecessary probe or sign-in
        expect(imageProps()?.source).toEqual({...SOURCE, cacheKey: SOURCE.uri, headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: 'current-token'}});
        expect(isImageAuthenticationRequired).not.toHaveBeenCalled();
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
    });

    it('reports a retry failure without starting another authentication flow in the mounted image', async () => {
        // Given a failed image whose credentials have subsequently changed
        const onError = jest.fn();
        const {rerender} = render(<TestImage onError={onError} />);
        await failImage();
        rerender(
            <TestImage
                onError={onError}
                session={{...SESSION, encryptedAuthToken: 'retry-token'}}
            />,
        );

        // When its retried request also fails
        await failImage();

        // Then a permanent image error is delivered instead of another authentication attempt
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it('ignores duplicate errors from a retained web callback during recovery', async () => {
        // Given an image whose authentication request is still pending
        let completeAuthentication: ((result: {wasSuccessful: boolean}) => void) | undefined;
        jest.mocked(reauthenticateAttachmentImages).mockReturnValueOnce(
            new Promise((resolve) => {
                completeAuthentication = resolve;
            }),
        );
        const onError = jest.fn();
        render(<TestImage onError={onError} />);
        const oldError = imageProps()?.onError;
        await failImage();

        // When the web loader invokes the same retained callback again
        await act(async () => {
            oldError?.();
        });

        // Then recovery is not started twice and the image stays pending until it completes
        expect(isImageAuthenticationRequired).toHaveBeenCalledTimes(1);
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
        await act(async () => {
            completeAuthentication?.({wasSuccessful: true});
        });
    });

    it.each([{isOffline: true}, {isAuthTokenRequired: false}, {source: {uri: 'https://attacker.example/receipt.jpg'}}])(
        'does not start authentication for an offline or unauthenticated image: %s',
        async (props) => {
            // Given a request outside online authenticated attachment loading
            const onError = jest.fn();
            render(
                <TestImage
                    {...props}
                    onError={onError}
                />,
            );

            // When that request fails
            await failImage();

            // Then its normal error handler runs without a sign-in attempt
            expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
            expect(onError).toHaveBeenCalledTimes(1);
        },
    );

    it.each([false, true])('uses failure-driven authentication for both account types; SAML=%s', async (signedInWithSAML) => {
        // Given an authenticated image whose account type must not change image recovery
        render(<TestImage session={{...SESSION, signedInWithSAML}} />);

        // When loading fails and the probe confirms HTTP 401
        await failImage();

        // Then both account types use the existing reauthentication flow
        expect(isImageAuthenticationRequired).toHaveBeenCalledWith(SOURCE.uri, SESSION.encryptedAuthToken);
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(1);
    });

    it('reports a failed authentication request through the normal image error handler', async () => {
        // Given a transport failure while initiating image-triggered reauthentication
        const onError = jest.fn();
        jest.mocked(reauthenticateAttachmentImages).mockRejectedValueOnce(new Error('Network unavailable'));
        render(<TestImage onError={onError} />);

        // When recovery cannot start or complete its request
        await failImage();

        // Then the image does not leave its caller loading indefinitely
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it.each(['source', 'account', 'unmount'] as const)('ignores an old error callback after a %s change', async (change) => {
        // Given the callback from an image request that is about to become obsolete
        const {rerender, unmount} = render(<TestImage />);
        const staleError = imageProps()?.onError;

        // When the request or mounted view changes before its callback arrives
        if (change === 'source') {
            rerender(<TestImage source={OTHER_SOURCE} />);
        } else if (change === 'account') {
            rerender(<TestImage session={{...SESSION, accountID: 456}} />);
        } else {
            unmount();
        }
        await act(async () => {
            staleError?.();
        });

        // Then the obsolete request cannot initiate a sign-in for the current view
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
    });

    it('preserves loading without a token header before credentials hydrate', () => {
        // Given a session whose encrypted token has not hydrated
        const waitForSession = jest.fn();
        const {rerender} = render(
            <TestImage
                session={{accountID: SESSION.accountID}}
                waitForSession={waitForSession}
            />,
        );
        expect(imageProps()?.source).toBe(SOURCE);
        expect(waitForSession).not.toHaveBeenCalled();

        // When the encrypted token becomes available
        rerender(<TestImage waitForSession={waitForSession} />);

        // Then the source can include credentials without adding a new pre-hydration wait
        expect(imageProps()?.source).toEqual({...SOURCE, cacheKey: SOURCE.uri, headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: SESSION.encryptedAuthToken}});
    });

    it('ends loading when authentication returns unsuccessful without a session update', async () => {
        // Given authentication that stops early without redirecting or restoring credentials
        jest.mocked(reauthenticateAttachmentImages).mockResolvedValueOnce({wasSuccessful: false});
        const onError = jest.fn();
        const waitForSession = jest.fn();
        const {rerender} = render(
            <TestImage
                onError={onError}
                waitForSession={waitForSession}
            />,
        );
        const originalSource = imageProps()?.source;

        // When the image needs authentication but recovery does not succeed
        await failImage();

        // Then the caller is notified instead of waiting indefinitely for an unrelated token update
        expect(waitForSession).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(1);
        rerender(
            <TestImage
                onError={onError}
                session={{...SESSION, encryptedAuthToken: 'later-token'}}
            />,
        );
        expect(imageProps()?.source).toBe(originalSource);
    });

    it('preserves source rebuilding after reconnect so offline loads can restart', () => {
        // Given an image whose web fetch may have failed while offline
        const {rerender} = render(<TestImage isOffline />);
        const offlineSource = imageProps()?.source;

        // When the connection is restored
        rerender(<TestImage />);

        // Then the changed source restarts the loader without preemptive authentication
        expect(imageProps()?.source).not.toBe(offlineSource);
        expect(imageProps()?.source).toEqual({...SOURCE, cacheKey: SOURCE.uri, headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: SESSION.encryptedAuthToken}});
        const firstOnlineSource = imageProps()?.source;
        rerender(<TestImage isOffline />);
        rerender(<TestImage />);
        expect(imageProps()?.source).not.toBe(firstOnlineSource);
        expect(isImageAuthenticationRequired).not.toHaveBeenCalled();
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
    });

    it('clears terminal failure bookkeeping when reconnect starts a new request', async () => {
        // Given an image whose non-authentication failure already ended loading
        jest.mocked(isImageAuthenticationRequired).mockResolvedValue(false);
        const onError = jest.fn();
        const {rerender} = render(<TestImage onError={onError} />);
        await failImage();
        expect(onError).toHaveBeenCalledTimes(1);

        // When reconnect starts a fresh request and that request also fails
        rerender(
            <TestImage
                onError={onError}
                isOffline
            />,
        );
        rerender(<TestImage onError={onError} />);
        await failImage();

        // Then the old terminal state cannot swallow the new request's error callback
        expect(isImageAuthenticationRequired).toHaveBeenCalledTimes(2);
        expect(onError).toHaveBeenCalledTimes(2);
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
    });

    it('keeps recovery pending when a caller recreates a plain URI source', async () => {
        // Given a pending probe and a caller that creates a fresh source object on every render
        let completeProbe: ((requiresAuthentication: boolean) => void) | undefined;
        jest.mocked(isImageAuthenticationRequired).mockReturnValueOnce(
            new Promise((resolve) => {
                completeProbe = resolve;
            }),
        );
        const {rerender} = render(<TestImage source={{uri: SOURCE.uri}} />);
        const originalSource = imageProps()?.source;
        await failImage();

        // When the parent re-renders with the same URI while recovery is pending
        rerender(<TestImage source={{uri: SOURCE.uri}} />);
        expect(imageProps()?.source).toBe(originalSource);
        await act(async () => {
            completeProbe?.(true);
        });

        // Then the same image request can finish recovery without relying on caller memoization
        expect(isImageAuthenticationRequired).toHaveBeenCalledTimes(1);
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(1);
    });

    it('rebuilds a same-URI source when additional source options change', () => {
        // Given a source whose options carry information beyond the URI
        const {rerender} = render(<TestImage source={{uri: SOURCE.uri, width: 100}} />);
        const originalSource = imageProps()?.source;

        // When the caller supplies different source dimensions
        rerender(<TestImage source={{uri: SOURCE.uri, width: 200}} />);

        // Then URI matching does not hide the changed source options
        expect(imageProps()?.source).not.toBe(originalSource);
        expect(imageProps()?.source).toEqual(expect.objectContaining({width: 200}));
    });

    it('keeps non-401 image failures on the normal error path', async () => {
        // Given a failed image whose HEAD request does not confirm an authentication failure
        const onError = jest.fn();
        jest.mocked(isImageAuthenticationRequired).mockResolvedValueOnce(false);
        const {rerender} = render(<TestImage onError={onError} />);
        const originalSource = imageProps()?.source;

        // When the probe reports an ordinary image failure and another API later updates the session
        await failImage();
        rerender(
            <TestImage
                onError={onError}
                session={{...SESSION, encryptedAuthToken: 'later-token'}}
            />,
        );

        // Then neither authentication nor an unrelated token update retries a non-authentication error
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(imageProps()?.source).toBe(originalSource);
    });

    it('does not reauthenticate when the authentication probe fails', async () => {
        // Given a network or CORS failure that cannot establish an HTTP status
        const onError = jest.fn();
        jest.mocked(isImageAuthenticationRequired).mockRejectedValueOnce(new Error('Failed to fetch'));
        render(<TestImage onError={onError} />);

        // When the follow-up HEAD request fails
        await failImage();

        // Then transport errors do not become SAML sign-in requests
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it.each(['token', 'source', 'account', 'unmount'] as const)('ignores an HTTP 401 probe after a %s change', async (change) => {
        // Given a pending authentication check for an image that may become obsolete
        let completeProbe: ((requiresAuthentication: boolean) => void) | undefined;
        jest.mocked(isImageAuthenticationRequired).mockReturnValueOnce(
            new Promise((resolve) => {
                completeProbe = resolve;
            }),
        );
        const onError = jest.fn();
        const {rerender, unmount} = render(<TestImage onError={onError} />);
        await failImage();

        // When a new request or session takes over before the response arrives
        if (change === 'token') {
            rerender(
                <TestImage
                    onError={onError}
                    session={{...SESSION, encryptedAuthToken: 'already-current-token'}}
                />,
            );
        } else if (change === 'source') {
            rerender(
                <TestImage
                    onError={onError}
                    source={OTHER_SOURCE}
                />,
            );
        } else if (change === 'account') {
            rerender(
                <TestImage
                    onError={onError}
                    session={{...SESSION, accountID: 456}}
                />,
            );
        } else {
            unmount();
        }
        await act(async () => {
            completeProbe?.(true);
        });

        // Then a stale authorization rejection cannot start a new sign-in flow
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });
});
