/** Checks the native statement WebView's navigation and message boundaries. */
import {fireEvent, render} from '@testing-library/react-native';

import type * as NativeWalletStatementModal from '@components/WalletStatementModal/index.native';
import handleWalletStatementNavigation from '@components/WalletStatementModal/walletNavigationUtils';

import CONST from '@src/CONST';

import type {WebViewProps} from 'react-native-webview';
import type {ShouldStartLoadRequestEvent, WebViewOpenWindowEvent} from 'react-native-webview/lib/WebViewTypes';
import type * as WebViewShared from 'react-native-webview/src/WebViewShared';

import React from 'react';
import {Linking, View as MockView} from 'react-native';
import {WebView} from 'react-native-webview';

import createMock from '../utils/createMock';

const {default: WalletStatementModal} = jest.requireActual<typeof NativeWalletStatementModal>('../../src/components/WalletStatementModal/index.native');
const {createOnShouldStartLoadWithRequest} = jest.requireActual<typeof WebViewShared>('react-native-webview/src/WebViewShared');

jest.mock('react-native-webview', () => ({
    WebView: jest.fn((props: WebViewProps) => (
        <MockView
            {...props}
            testID="wallet-statement-webview"
        />
    )),
}));
jest.mock('@components/WalletStatementModal/walletNavigationUtils', () => jest.fn());
jest.mock('@components/ActivityIndicator', () => () => null);
jest.mock('@hooks/useOnyx', () => (key: string) => [key === 'session' ? {authToken: 'test-wallet-token', accountID: 123} : undefined, {status: 'loaded'}]);
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetailsByIDs: () => [undefined, {status: 'loaded'}]}));
jest.mock('@hooks/useDelegateAccountID', () => () => undefined);
jest.mock('@hooks/useThemeStyles', () => () => ({fullScreenLoading: {}}));

const STATEMENT_PAGE_URL = 'https://www.expensify.com/statement.php?period=202610';
const PAY_SOMEONE_MESSAGE = {type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: 'https://new.expensify.com/start/pay/manual'};
const UNTRUSTED_URLS = [
    'https://attacker.example/',
    'https://www.expensify.com.attacker.example/',
    'https://www.expensify.com@attacker.example/',
    'https://new.expensify.com/',
    'https://www.expensify.com:444/',
    'http://www.expensify.com/',
    'blob:https://www.expensify.com/statement',
    'data:text/html,statement',
    // eslint-disable-next-line no-script-url -- Verify that the statement rejects script URLs.
    'javascript:void(0)',
    'mailto:concierge@expensify.com',
    'about:blank',
    'not a URL',
    '',
];

function renderModal(statementPageURL = STATEMENT_PAGE_URL) {
    const screen = render(<WalletStatementModal statementPageURL={statementPageURL} />, {createNodeMock: () => ({})});
    const webView = screen.queryByTestId('wallet-statement-webview');
    const props = jest.mocked(WebView).mock.lastCall?.[0];

    const getWebViewProps = () => {
        if (!webView || !props) {
            throw new Error('Statement WebView did not mount');
        }
        return props;
    };

    return {
        webView,
        getWebViewProps,
        postMessage: (data: string, url = statementPageURL) => {
            if (!webView) {
                throw new Error('Statement WebView did not mount');
            }
            fireEvent(webView, 'message', {nativeEvent: {url, data}});
        },
        shouldLoad: (url: string) => {
            const {originWhitelist, onShouldStartLoadWithRequest} = getWebViewProps();
            const decide = jest.fn<void, [boolean, string, number]>();
            const checkNavigation = createOnShouldStartLoadWithRequest(decide, originWhitelist ?? [], onShouldStartLoadWithRequest);
            checkNavigation(createMock<ShouldStartLoadRequestEvent>({nativeEvent: {url, lockIdentifier: 1}}));
            return decide.mock.calls.at(0)?.[0];
        },
    };
}

describe('WalletStatementModal on native', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        {type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: 'https://new.expensify.com/start/submit/manual'},
        PAY_SOMEONE_MESSAGE,
        {type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: 'https://new.expensify.com/start/split/manual'},
        {type: CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE, url: undefined},
    ])('accepts a valid statement action: $type $url', (message) => {
        // Given the app loaded its own statement page
        const {postMessage} = renderModal();

        // When the statement asks to open one of its existing actions
        postMessage(JSON.stringify(message));

        // Then the app passes only the supported action to its existing navigation handler
        expect(handleWalletStatementNavigation).toHaveBeenCalledTimes(1);
        expect(jest.mocked(handleWalletStatementNavigation).mock.calls.at(0)?.slice(-2)).toEqual([message.type, message.url]);
    });

    it.each(UNTRUSTED_URLS)('ignores a message from %s', (url) => {
        // Given the statement is open and the bridge reports a different or invalid source
        const {postMessage} = renderModal();

        // When that source sends an otherwise valid action
        postMessage(JSON.stringify(PAY_SOMEONE_MESSAGE), url);

        // Then it cannot cause navigation in the app
        expect(handleWalletStatementNavigation).not.toHaveBeenCalled();
    });

    it.each([
        '{broken',
        'null',
        '[]',
        'true',
        '123',
        '"STATEMENT_NAVIGATE"',
        '{}',
        JSON.stringify({type: 'UNKNOWN', url: PAY_SOMEONE_MESSAGE.url}),
        JSON.stringify({type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT}),
        JSON.stringify({type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: ''}),
        JSON.stringify({type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: {}}),
        JSON.stringify({type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: []}),
        JSON.stringify({type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: 123}),
        JSON.stringify({type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: null}),
    ])('ignores an invalid message without throwing: %s', (data) => {
        // Given even the trusted page can send an unexpected payload
        const {postMessage} = renderModal();

        // When the bridge receives invalid JSON or an unsupported action shape
        expect(() => postMessage(data)).not.toThrow();

        // Then malformed data never reaches the navigation handler
        expect(handleWalletStatementNavigation).not.toHaveBeenCalled();
    });

    it.each(UNTRUSTED_URLS)('blocks navigation to %s without opening another app', async (url) => {
        // Given the statement does not need to navigate to another origin or launch another app
        const canOpenURL = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
        const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
        const {shouldLoad} = renderModal();

        try {
            // When WebView applies its real whitelist and navigation callback to the requested URL
            const shouldStart = shouldLoad(url);
            await Promise.resolve();

            // Then it rejects the URL without falling back to the operating system's URL handler
            expect(shouldStart).toBe(false);
            expect(canOpenURL).not.toHaveBeenCalled();
            expect(openURL).not.toHaveBeenCalled();
        } finally {
            canOpenURL.mockRestore();
            openURL.mockRestore();
        }
    });

    it.each([STATEMENT_PAGE_URL, 'https://staging.expensify.com/statement.php?period=202610', 'http://dev.expensify.com:8080/statement.php?period=202610'])(
        'uses the configured statement origin for %s',
        (statementPageURL) => {
            // Given each environment supplies its own statement URL
            const {postMessage, shouldLoad} = renderModal(statementPageURL);

            // When that page navigates within its origin and posts a valid action
            const shouldStart = shouldLoad(`${statementPageURL}&isDarkMode=true`);
            postMessage(JSON.stringify(PAY_SOMEONE_MESSAGE));

            // Then the feature keeps working without a hardcoded production domain
            expect(shouldStart).toBe(true);
            expect(handleWalletStatementNavigation).toHaveBeenCalledTimes(1);
        },
    );

    it('normalizes the origin before comparing navigation and message URLs', () => {
        // Given the statement URL uses the default HTTPS port
        const {postMessage, shouldLoad} = renderModal();
        const normalizedURL = 'https://WWW.EXPENSIFY.COM:443/statement.php?period=202610';

        // When native reports the same origin with different casing and an explicit port
        const shouldStart = shouldLoad(normalizedURL);
        postMessage(JSON.stringify(PAY_SOMEONE_MESSAGE), normalizedURL);

        // Then equivalent URLs still allow the statement's normal actions
        expect(shouldStart).toBe(true);
        expect(handleWalletStatementNavigation).toHaveBeenCalledTimes(1);
    });

    it.each(['not a URL', 'about:blank', 'data:text/html,statement'])('does not mount a credentialed WebView for an invalid initial URL: %s', (statementPageURL) => {
        // Given Android does not run its navigation callback for the initial source
        // When an invalid or non-HTTP statement URL reaches the component
        const {webView} = renderModal(statementPageURL);

        // Then no WebView can load it with the user's authentication header
        expect(webView).toBeNull();
    });

    it('ignores new-window requests and preserves statement loading and authentication', () => {
        // Given the statement's links work through messages rather than popup windows
        const {getWebViewProps} = renderModal();
        const props = getWebViewProps();

        // When content asks for another window
        props.onOpenWindow?.(createMock<WebViewOpenWindowEvent>({nativeEvent: {targetUrl: 'https://attacker.example/'}}));

        // Then a no-op callback prevents WebView's default popup handling, without changing its source or loading behavior
        expect(props.onOpenWindow).toEqual(expect.any(Function));
        expect(handleWalletStatementNavigation).not.toHaveBeenCalled();
        expect(props.source).toEqual({uri: STATEMENT_PAGE_URL, headers: {Cookie: 'authToken=test-wallet-token'}});
        expect(props.incognito).toBe(true);
        expect(props.startInLoadingState).toBe(true);
        expect(props.renderLoading).toEqual(expect.any(Function));
    });
});
