import {act, render} from '@testing-library/react-native';

import Image from '@components/Image';
import BaseImage from '@components/Image/BaseImage';
import type {ImageProps} from '@components/Image/types';

import reauthenticateAttachmentImages from '@libs/actions/Session/AttachmentImageReauthenticator';

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
    __esModule: true,
    default: jest.fn(),
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

function renderImage(props: TestImageProps = {}) {
    const {rerender, unmount} = render(<TestImage {...props} />);
    return {unmount, rerenderImage: (nextProps: TestImageProps = {}) => rerender(<TestImage {...nextProps} />)};
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
        jest.mocked(reauthenticateAttachmentImages).mockReset().mockResolvedValue({wasSuccessful: true});
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it.each([undefined, SESSION.creationDate])('loads without preemptive authentication when creationDate is %s', (creationDate) => {
        // Given a timestamp that cannot establish token validity
        // When the first authenticated image renders
        renderImage({session: {...SESSION, creationDate}});

        // Then existing credentials reach the loader before any authentication request
        expect(imageProps()?.source).toHaveProperty(['headers', CONST.CHAT_ATTACHMENT_TOKEN_KEY], SESSION.encryptedAuthToken);
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
    });

    it.each([false, true])('delegates recovery to the API path for either account type; SAML=%s', async (signedInWithSAML) => {
        // Given an authenticated image whose loader does not expose the HTTP failure status
        const onError = jest.fn();
        const waitForSession = jest.fn();
        renderImage({session: {...SESSION, signedInWithSAML}, onError, waitForSession});

        // When the image fails but recovery is still permitted
        await failImage();

        // Then classification belongs to the API helper and the caller waits rather than ending loading
        expect(reauthenticateAttachmentImages).toHaveBeenCalledWith(SOURCE.uri, SESSION.encryptedAuthToken, expect.any(AbortSignal));
        expect(waitForSession).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    it('retries only the failed image once while keeping successful sources stable', async () => {
        // Given two images, only one of which reports an error
        const onError = jest.fn();
        const tree = (session: Session) => (
            <>
                <TestImage
                    session={session}
                    onError={onError}
                />
                <TestImage
                    session={session}
                    source={OTHER_SOURCE}
                />
            </>
        );
        const {rerender} = render(tree(SESSION));
        const successfulSource = imageProps(OTHER_SOURCE.uri)?.source;
        await failImage();

        // When the session supplies a replacement token and that image retry also fails
        rerender(tree({...SESSION, encryptedAuthToken: 'retry-token'}));
        expect(imageProps()?.source).toHaveProperty(['headers', CONST.CHAT_ATTACHMENT_TOKEN_KEY], 'retry-token');
        expect(imageProps(OTHER_SOURCE.uri)?.source).toBe(successfulSource);
        const retriedSource = imageProps()?.source;
        rerender(tree({...SESSION, encryptedAuthToken: 'later-token'}));
        expect(imageProps()?.source).toBe(retriedSource);
        await failImage();

        // Then later rotations cannot reload the replacement, and a failed retry is terminal
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it('uses current credentials even when web retains an earlier error callback', async () => {
        // Given a callback retained before an API session update
        const {rerenderImage} = renderImage();
        const oldError = imageProps()?.onError;
        rerenderImage({session: {...SESSION, encryptedAuthToken: 'current-token'}});

        // When the older image request invokes its callback
        await act(async () => {
            oldError?.();
        });

        // Then current credentials are reused without an unnecessary probe or sign-in
        expect(imageProps()?.source).toHaveProperty(['headers', CONST.CHAT_ATTACHMENT_TOKEN_KEY], 'current-token');
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
    });

    it('keeps one recovery pending across duplicate callbacks and recreated plain URI sources', async () => {
        // Given a pending probe and a caller that recreates its source object on each render
        let complete: ((result: {wasSuccessful: boolean}) => void) | undefined;
        jest.mocked(reauthenticateAttachmentImages).mockReturnValueOnce(
            new Promise((resolve) => {
                complete = resolve;
            }),
        );
        const onError = jest.fn();
        const {rerenderImage} = renderImage({onError, source: {uri: SOURCE.uri}});
        const originalSource = imageProps()?.source;
        const oldError = imageProps()?.onError;
        await failImage();

        // When the parent re-renders and the loader invokes its retained callback again
        rerenderImage({onError, source: {uri: SOURCE.uri}});
        await act(async () => {
            oldError?.();
            complete?.({wasSuccessful: true});
        });

        // Then source identity and the pending recovery survive without caller memoization
        expect(imageProps()?.source).toBe(originalSource);
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    it.each([{isOffline: true}, {isAuthTokenRequired: false}, {source: {uri: 'https://attacker.example/receipt.jpg'}}])('skips recovery outside trusted online images: %s', async (props) => {
        // Given an image outside online authenticated attachment loading
        const onError = jest.fn();
        renderImage({...props, onError});

        // When that image fails
        await failImage();

        // Then ordinary error handling runs without a sign-in attempt
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it.each(['unsuccessful', 'rejected'])('ends loading after %s recovery without retrying on later token changes', async (outcome) => {
        // Given recovery that cannot restore the failed image
        if (outcome === 'rejected') {
            jest.mocked(reauthenticateAttachmentImages).mockRejectedValueOnce(new Error('Failed to fetch'));
        } else {
            jest.mocked(reauthenticateAttachmentImages).mockResolvedValueOnce({wasSuccessful: false});
        }
        const onError = jest.fn();
        const {rerenderImage} = renderImage({onError});
        const originalSource = imageProps()?.source;

        // When recovery ends and an unrelated API later updates credentials
        await failImage();
        rerenderImage({onError, session: {...SESSION, encryptedAuthToken: 'later-token'}});

        // Then loading ends once and the terminal failure is not retried
        expect(onError).toHaveBeenCalledTimes(1);
        expect(imageProps()?.source).toBe(originalSource);
    });

    it.each([
        ['source', false],
        ['account', false],
        ['unmount', false],
        ['source', true],
        ['account', true],
        ['unmount', true],
        ['token', true],
    ] as const)('ignores obsolete callbacks and recovery after %s changes; recovery pending=%s', async (change, isPending) => {
        // Given an image that becomes obsolete before its error or recovery result arrives
        let complete: ((result: {wasSuccessful: boolean}) => void) | undefined;
        jest.mocked(reauthenticateAttachmentImages).mockReturnValueOnce(
            new Promise((resolve) => {
                complete = resolve;
            }),
        );
        const onError = jest.fn();
        const {rerenderImage, unmount} = renderImage({onError});
        const staleError = imageProps()?.onError;
        if (isPending) {
            await failImage();
        }

        // When a new request or view takes over, even a late failure belongs to the old image
        if (change === 'unmount') {
            unmount();
        } else {
            rerenderImage({
                onError,
                source: change === 'source' ? OTHER_SOURCE : SOURCE,
                session: {...SESSION, accountID: change === 'account' ? 456 : SESSION.accountID, encryptedAuthToken: change === 'token' ? 'current-token' : SESSION.encryptedAuthToken},
            });
        }
        await act(async () => {
            staleError?.();
            complete?.({wasSuccessful: false});
        });

        // Then old work cannot authenticate or report an error for the current view
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(isPending ? 1 : 0);
        if (isPending) {
            expect(jest.mocked(reauthenticateAttachmentImages).mock.calls.at(0)?.[2]?.aborted).toBe(true);
        }
        expect(onError).not.toHaveBeenCalled();
    });

    it('preserves loading before credentials hydrate, then adds the token header', () => {
        // Given a session whose encrypted token has not hydrated
        const {rerenderImage} = renderImage({session: {accountID: SESSION.accountID}});
        expect(imageProps()?.source).toBe(SOURCE);

        // When the encrypted token becomes available
        rerenderImage();

        // Then the loader receives credentials without a preemptive authentication flow
        expect(imageProps()?.source).toHaveProperty(['headers', CONST.CHAT_ATTACHMENT_TOKEN_KEY], SESSION.encryptedAuthToken);
        expect(reauthenticateAttachmentImages).not.toHaveBeenCalled();
    });

    it('rebuilds sources and clears terminal failures when reconnect starts a new request', async () => {
        // Given an image whose ordinary failure already ended loading
        jest.mocked(reauthenticateAttachmentImages).mockResolvedValue({wasSuccessful: false});
        const onError = jest.fn();
        const {rerenderImage} = renderImage({onError});
        await failImage();
        const originalSource = imageProps()?.source;

        // When reconnect starts a fresh request and that request also fails
        rerenderImage({onError, isOffline: true});
        rerenderImage({onError});
        expect(imageProps()?.source).not.toBe(originalSource);
        await failImage();

        // Then old failure bookkeeping cannot swallow the new request's error callback
        expect(reauthenticateAttachmentImages).toHaveBeenCalledTimes(2);
        expect(onError).toHaveBeenCalledTimes(2);
    });

    it('rebuilds a same-URI source when additional options change', () => {
        // Given source options carrying information beyond the URI
        const {rerenderImage} = renderImage({source: {uri: SOURCE.uri, width: 100}});

        // When the caller supplies different dimensions
        rerenderImage({source: {uri: SOURCE.uri, width: 200}});

        // Then URI matching cannot hide the changed options
        expect(imageProps()?.source).toHaveProperty('width', 200);
    });
});
