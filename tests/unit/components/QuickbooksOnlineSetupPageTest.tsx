import {render, screen} from '@testing-library/react-native';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';

// This test exercises the native (in-app WebView) variant; jest resolves the `.native` entry point by default.
import QuickbooksOnlineSetupPage from '@pages/workspace/accounting/qbo/QuickbooksOnlineSetupPage/index.native';

import {getShortLivedAuthTokenURL} from '@userActions/Link';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';

import React from 'react';
import {View} from 'react-native';

const AUTH_TOKEN = 'test-auth-token';
const POLICY_ID = '123';

type WebViewProps = {
    source?: {uri?: string; headers?: Record<string, string>};
};

// Capture the props the mocked WebView renders with so we can assert on the URI/headers it receives.
const mockWebViewProps: {current: WebViewProps | undefined} = {
    current: undefined,
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockView = View;

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
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
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
    });

    it('disables policy taxes because QBO does not support them', () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockedEnablePolicyTaxes).toHaveBeenCalledWith(POLICY_ID, false);
    });

    it('opens a WebView pointing at the QuickBooks Online setup link for the given policy', () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockedGetQuickbooksOnlineSetupLink).toHaveBeenCalledWith(POLICY_ID);
        // QBO does not opt into the short-lived auth token, so the WebView must mount immediately with the raw setup link.
        expect(mockedGetShortLivedAuthTokenURL).not.toHaveBeenCalled();
        expect(screen.getByTestId('qbo-webview')).toBeOnTheScreen();
        expect(mockWebViewProps.current?.source?.uri).toBe(`https://qbo-setup.example/${POLICY_ID}`);
    });

    it('passes the session auth token to the WebView as a cookie', () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockWebViewProps.current?.source?.headers?.Cookie).toBe(`authToken=${AUTH_TOKEN}`);
    });
});
