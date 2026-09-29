import {act, render, screen} from '@testing-library/react-native';

import {getXeroSetupLink} from '@libs/actions/connections/Xero';

// This test exercises the native (in-app WebView) variant; jest resolves the `.native` entry point by default.
import XeroSetupPage from '@pages/workspace/accounting/xero/XeroSetupPage/index.native';

import {getShortLivedAuthTokenURL} from '@userActions/Link';

import React from 'react';
import {View} from 'react-native';

const AUTH_TOKEN = 'test-auth-token';
const POLICY_ID = '123';
const SHORT_LIVED_AUTH_TOKEN = 'short-lived-auth-token';

type WebViewProps = {
    source?: {uri?: string; headers?: Record<string, string>};
};

// Capture the props the mocked WebView renders with so we can assert on them.
const mockWebViewProps: {current: WebViewProps | undefined} = {
    current: undefined,
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockView = View;

// Controls the network state the mocked useNetwork hook reports, and captures its onReconnect callback so tests can simulate a reconnect.
const mockNetworkState = {isOffline: false};
const mockOnReconnect: {current: (() => void) | undefined} = {current: undefined};

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [{authToken: 'test-auth-token'}]));
jest.mock('@libs/actions/connections/Xero', () => ({
    getXeroSetupLink: jest.fn((policyID: string) => `https://xero-setup.example/${policyID}`),
}));
jest.mock('@userActions/Link', () => ({
    getShortLivedAuthTokenURL: jest.fn((setupLink: string) => Promise.resolve(`${setupLink}?authToken=short-lived-auth-token`)),
}));
jest.mock('@hooks/useNetwork', () =>
    jest.fn(({onReconnect}: {onReconnect?: () => void} = {}) => {
        mockOnReconnect.current = onReconnect;
        return {isOffline: mockNetworkState.isOffline};
    }),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));
jest.mock('@components/ScreenWrapper', () => {
    const MockScreenWrapper = ({children}: {children: React.ReactNode}) => children;
    MockScreenWrapper.displayName = 'ScreenWrapper';
    return MockScreenWrapper;
});
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ActivityIndicator', () => () => <MockView testID="setup-loading-indicator" />);
jest.mock(
    '@components/BlockingViews/FullPageOfflineBlockingView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('react-native-webview', () => ({
    WebView: ({source}: WebViewProps) => {
        mockWebViewProps.current = {source};
        return <MockView testID="xero-webview" />;
    },
}));

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Accounting_Xero_Setup',
    params: {
        policyID: POLICY_ID,
    },
};

const mockedGetXeroSetupLink = jest.mocked(getXeroSetupLink);
const mockedGetShortLivedAuthTokenURL = jest.mocked(getShortLivedAuthTokenURL);

const renderXeroSetupPage = () =>
    render(
        <XeroSetupPage
            // @ts-expect-error - route type from navigator
            route={mockRoute}
        />,
    );

describe('XeroSetupPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockWebViewProps.current = undefined;
        mockNetworkState.isOffline = false;
        mockOnReconnect.current = undefined;
    });

    it('shows the loading indicator until the authenticated setup URL resolves, then opens a WebView pointing at it', async () => {
        renderXeroSetupPage();

        expect(mockedGetXeroSetupLink).toHaveBeenCalledWith(POLICY_ID);
        expect(mockedGetShortLivedAuthTokenURL).toHaveBeenCalledWith(`https://xero-setup.example/${POLICY_ID}`);

        // Until the short-lived auth token resolves, only the loading indicator should be visible.
        expect(screen.queryByTestId('xero-webview')).not.toBeOnTheScreen();
        expect(screen.getByTestId('setup-loading-indicator')).toBeOnTheScreen();

        expect(await screen.findByTestId('xero-webview')).toBeOnTheScreen();

        // The WebView must load the authenticated URL, not the raw getXeroSetupLink() command URL.
        expect(mockWebViewProps.current?.source?.uri).toBe(`https://xero-setup.example/${POLICY_ID}?authToken=${SHORT_LIVED_AUTH_TOKEN}`);
    });

    it('passes the session auth token to the WebView as a cookie', async () => {
        renderXeroSetupPage();

        expect(await screen.findByTestId('xero-webview')).toBeOnTheScreen();

        expect(mockWebViewProps.current?.source?.headers?.Cookie).toBe(`authToken=${AUTH_TOKEN}`);
    });

    it('skips the token request while offline and fetches the authenticated URL on reconnect', async () => {
        mockNetworkState.isOffline = true;
        renderXeroSetupPage();

        // No token request should fire while offline, so the WebView must not mount with an unauthenticated URL.
        expect(mockedGetShortLivedAuthTokenURL).not.toHaveBeenCalled();
        expect(screen.queryByTestId('xero-webview')).not.toBeOnTheScreen();
        expect(screen.getByTestId('setup-loading-indicator')).toBeOnTheScreen();

        // Simulate the network coming back: useNetwork fires its onReconnect callback.
        mockNetworkState.isOffline = false;
        act(() => mockOnReconnect.current?.());

        expect(mockedGetShortLivedAuthTokenURL).toHaveBeenCalledWith(`https://xero-setup.example/${POLICY_ID}`);
        expect(await screen.findByTestId('xero-webview')).toBeOnTheScreen();
        expect(mockWebViewProps.current?.source?.uri).toBe(`https://xero-setup.example/${POLICY_ID}?authToken=${SHORT_LIVED_AUTH_TOKEN}`);
    });
});
