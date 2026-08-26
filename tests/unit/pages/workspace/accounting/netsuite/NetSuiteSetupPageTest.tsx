import {render, screen} from '@testing-library/react-native';

import {getNetSuiteSetupLink} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';

// This test exercises the native (in-app WebView) variant; jest resolves the `.native` entry point by default.
import NetSuiteSetupPage from '@pages/workspace/accounting/netsuite/NetSuiteSetupPage/index.native';

import {getShortLivedAuthTokenURL} from '@userActions/Link';

import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

const POLICY_ID = '123';
const ACCOUNT_ID = 'TSTDRV1234567';

type HeaderProps = {
    onBackButtonPress?: () => void;
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockView = View;

// Capture the header props so the tests can press back.
const mockHeaderProps: {current: HeaderProps | undefined} = {current: undefined};

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [{authToken: 'test-auth-token'}]));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@libs/actions/connections/NetSuiteCommands', () => ({
    getNetSuiteSetupLink: jest.fn((policyID: string, accountID: string) => `https://netsuite-setup.example/${policyID}/${accountID}`),
}));
jest.mock('@userActions/Link', () => ({
    getShortLivedAuthTokenURL: jest.fn((setupLink: string) => Promise.resolve(`${setupLink}?authToken=short-lived-auth-token`)),
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
jest.mock('@components/HeaderWithBackButton', () => ({onBackButtonPress}: HeaderProps) => {
    mockHeaderProps.current = {onBackButtonPress};
    return null;
});
jest.mock('@components/ActivityIndicator', () => () => <MockView testID="setup-loading-indicator" />);
jest.mock(
    '@components/BlockingViews/FullPageOfflineBlockingView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('react-native-webview', () => ({
    WebView: () => <MockView testID="netsuite-webview" />,
}));

const mockedGetNetSuiteSetupLink = jest.mocked(getNetSuiteSetupLink);
const mockedGetShortLivedAuthTokenURL = jest.mocked(getShortLivedAuthTokenURL);
const mockedGoBack = jest.mocked(Navigation.goBack);

// Takes accountID explicitly rather than defaulting it, so a test can pass `undefined` to exercise the missing-param route.
const renderNetSuiteSetupPage = (accountID: string | undefined) =>
    render(
        <NetSuiteSetupPage
            // @ts-expect-error - route type from navigator
            route={{key: 'test-route', name: 'Workspace_Accounting_NetSuite_Setup', params: {policyID: POLICY_ID, accountID}}}
        />,
    );

describe('NetSuiteSetupPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHeaderProps.current = undefined;
    });

    it('opens a WebView pointing at the authenticated setup URL for the entered account', async () => {
        renderNetSuiteSetupPage(ACCOUNT_ID);

        expect(mockedGetNetSuiteSetupLink).toHaveBeenCalledWith(POLICY_ID, ACCOUNT_ID);
        expect(mockedGetShortLivedAuthTokenURL).toHaveBeenCalledWith(`https://netsuite-setup.example/${POLICY_ID}/${ACCOUNT_ID}`);
        expect(await screen.findByTestId('netsuite-webview')).toBeOnTheScreen();
    });

    it('returns to the accounting page on back, skipping the token input wizard underneath', async () => {
        renderNetSuiteSetupPage(ACCOUNT_ID);
        expect(await screen.findByTestId('netsuite-webview')).toBeOnTheScreen();

        mockHeaderProps.current?.onBackButtonPress?.();

        expect(mockedGoBack).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING.getRoute(POLICY_ID));
    });

    it('renders nothing when the account ID is missing from the route', () => {
        renderNetSuiteSetupPage(undefined);

        expect(screen.queryByTestId('netsuite-webview')).not.toBeOnTheScreen();
        expect(mockedGetNetSuiteSetupLink).not.toHaveBeenCalled();
    });
});
