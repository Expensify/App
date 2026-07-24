import {act, render, screen} from '@testing-library/react-native';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';

// This test exercises the native (in-app WebView) variant; jest resolves the `.native` entry point by default.
import QuickbooksOnlineSetupPage from '@pages/workspace/accounting/qbo/QuickbooksOnlineSetupPage/index.native';

import {getShortLivedAuthTokenURL} from '@userActions/Link';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';

import React from 'react';
import {View} from 'react-native';

const AUTH_TOKEN = 'test-auth-token';
const POLICY_ID = '123';
const SHORT_LIVED_AUTH_TOKEN = 'short-lived-auth-token';

type WebViewProps = {
    source?: {uri?: string; headers?: Record<string, string>};
};

// Capture the props the mocked WebView renders with so we can assert on the URI/headers it receives.
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
jest.mock('@libs/actions/connections/QuickbooksOnline', () => ({
    getQuickbooksOnlineSetupLink: jest.fn((policyID: string) => `https://qbo-setup.example/${policyID}`),
}));
jest.mock('@userActions/Policy/Policy', () => ({
    enablePolicyTaxes: jest.fn(),
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
        return <MockView testID="qbo-webview" />;
    },
}));

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Accounting_Quickbooks_Online_Setup',
    params: {
        policyID: POLICY_ID,
    },
};

const mockedGetQuickbooksOnlineSetupLink = jest.mocked(getQuickbooksOnlineSetupLink);
const mockedEnablePolicyTaxes = jest.mocked(enablePolicyTaxes);
const mockedGetShortLivedAuthTokenURL = jest.mocked(getShortLivedAuthTokenURL);

const renderQuickbooksOnlineSetupPage = () =>
    render(
        <QuickbooksOnlineSetupPage
            // @ts-expect-error - route type from navigator
            route={mockRoute}
        />,
    );

describe('QuickbooksOnlineSetupPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockWebViewProps.current = undefined;
        mockNetworkState.isOffline = false;
        mockOnReconnect.current = undefined;
    });

    it('disables policy taxes because QBO does not support them', () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockedEnablePolicyTaxes).toHaveBeenCalledWith(POLICY_ID, false);
    });

    it('shows the loading indicator until the authenticated setup URL resolves, then opens a WebView pointing at it', async () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockedGetQuickbooksOnlineSetupLink).toHaveBeenCalledWith(POLICY_ID);
        expect(mockedGetShortLivedAuthTokenURL).toHaveBeenCalledWith(`https://qbo-setup.example/${POLICY_ID}`);

        // Until the short-lived auth token resolves, only the loading indicator should be visible.
        expect(screen.queryByTestId('qbo-webview')).not.toBeOnTheScreen();
        expect(screen.getByTestId('setup-loading-indicator')).toBeOnTheScreen();

        expect(await screen.findByTestId('qbo-webview')).toBeOnTheScreen();

        // The WebView must load the authenticated URL, not the raw getQuickbooksOnlineSetupLink() command URL.
        expect(mockWebViewProps.current?.source?.uri).toBe(`https://qbo-setup.example/${POLICY_ID}?authToken=${SHORT_LIVED_AUTH_TOKEN}`);
    });

    it('passes the session auth token to the WebView as a cookie', async () => {
        renderQuickbooksOnlineSetupPage();

        expect(await screen.findByTestId('qbo-webview')).toBeOnTheScreen();

        expect(mockWebViewProps.current?.source?.headers?.Cookie).toBe(`authToken=${AUTH_TOKEN}`);
    });

    it('skips the token request while offline and fetches the authenticated URL on reconnect', async () => {
        mockNetworkState.isOffline = true;
        renderQuickbooksOnlineSetupPage();

        // No token request should fire while offline, so the WebView must not mount with an unauthenticated URL.
        expect(mockedGetShortLivedAuthTokenURL).not.toHaveBeenCalled();
        expect(screen.queryByTestId('qbo-webview')).not.toBeOnTheScreen();
        expect(screen.getByTestId('setup-loading-indicator')).toBeOnTheScreen();

        // Simulate the network coming back: useNetwork fires its onReconnect callback.
        mockNetworkState.isOffline = false;
        act(() => mockOnReconnect.current?.());

        expect(mockedGetShortLivedAuthTokenURL).toHaveBeenCalledWith(`https://qbo-setup.example/${POLICY_ID}`);
        expect(await screen.findByTestId('qbo-webview')).toBeOnTheScreen();
        expect(mockWebViewProps.current?.source?.uri).toBe(`https://qbo-setup.example/${POLICY_ID}?authToken=${SHORT_LIVED_AUTH_TOKEN}`);
    });
});
