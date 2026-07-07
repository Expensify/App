import {render, screen} from '@testing-library/react-native';

import {getXeroSetupLink} from '@libs/actions/connections/Xero';

// This test exercises the native (in-app WebView) variant; jest resolves the `.native` entry point by default.
import XeroSetupPage from '@pages/workspace/accounting/xero/XeroSetupPage/index.native';

import React from 'react';
import {View} from 'react-native';

const AUTH_TOKEN = 'test-auth-token';
const POLICY_ID = '123';

type WebViewProps = {
    source?: {uri?: string; headers?: Record<string, string>};
};

// Capture the props the mocked WebView renders with so we can assert on them.
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
jest.mock('@libs/actions/connections/Xero', () => ({
    getXeroSetupLink: jest.fn((policyID: string) => `https://xero-setup.example/${policyID}`),
}));
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
    });

    it('opens a WebView pointing at the Xero setup link for the given policy', () => {
        renderXeroSetupPage();

        expect(mockedGetXeroSetupLink).toHaveBeenCalledWith(POLICY_ID);
        expect(screen.getByTestId('xero-webview')).toBeOnTheScreen();
        expect(mockWebViewProps.current?.source?.uri).toBe(`https://xero-setup.example/${POLICY_ID}`);
    });

    it('passes the session auth token to the WebView as a cookie', () => {
        renderXeroSetupPage();

        expect(mockWebViewProps.current?.source?.headers?.Cookie).toBe(`authToken=${AUTH_TOKEN}`);
    });
});
