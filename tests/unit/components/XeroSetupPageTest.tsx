import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import Navigation from '@libs/Navigation/Navigation';
import XeroSetupPage from '@pages/workspace/accounting/xero/XeroSetupPage';
import ROUTES from '@src/ROUTES';

const AUTH_TOKEN = 'test-auth-token';
const TWO_FACTOR_AUTH_ROUTE = ROUTES.SETTINGS_2FA_ENABLED;
const POLICY_ID = '123';

type WebViewProps = {
    source?: {uri?: string; headers?: Record<string, string>};
};

type Require2FAProps = {
    isVisible: boolean;
    onSubmit: () => void;
    onCancel: () => void;
};

// Capture the props the mocked children render with so we can assert on / drive them from the tests.
const mockWebViewProps: {current: WebViewProps | undefined} = {
    current: undefined,
};
const mockRequire2FAProps: {current: Require2FAProps | undefined} = {
    current: undefined,
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockView = View;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [{authToken: 'test-auth-token'}]));
jest.mock('@hooks/useTwoFactorAuthRoute');
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
jest.mock('@components/RequireTwoFactorAuthenticationModal', () => ({isVisible, onSubmit, onCancel}: Require2FAProps) => {
    mockRequire2FAProps.current = {isVisible, onSubmit, onCancel};
    return isVisible ? <MockView testID="require-2fa-modal" /> : null;
});

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Accounting_Xero_Setup',
    params: {
        policyID: POLICY_ID,
    },
};

const mockedUseTwoFactorAuthRoute = jest.mocked(useTwoFactorAuthRoute);
const mockedGetXeroSetupLink = jest.mocked(getXeroSetupLink);
const mockedNavigate = jest.mocked(Navigation.navigate);
const mockedGoBack = jest.mocked(Navigation.goBack);
const mockedGetTwoFactorAuthRoute = jest.fn(() => TWO_FACTOR_AUTH_ROUTE);

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
        mockRequire2FAProps.current = undefined;
        mockedGetTwoFactorAuthRoute.mockReturnValue(TWO_FACTOR_AUTH_ROUTE);
    });

    describe('when 2FA is enabled', () => {
        beforeEach(() => {
            mockedUseTwoFactorAuthRoute.mockReturnValue({
                is2FAEnabled: true,
                getTwoFactorAuthRoute: mockedGetTwoFactorAuthRoute,
            });
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

        it('does not render the 2FA requirement modal', () => {
            renderXeroSetupPage();

            expect(screen.queryByTestId('require-2fa-modal')).toBeNull();
        });
    });

    describe('when 2FA is not enabled', () => {
        beforeEach(() => {
            mockedUseTwoFactorAuthRoute.mockReturnValue({
                is2FAEnabled: false,
                getTwoFactorAuthRoute: mockedGetTwoFactorAuthRoute,
            });
        });

        it('renders the 2FA requirement modal instead of opening the WebView', () => {
            renderXeroSetupPage();

            expect(screen.getByTestId('require-2fa-modal')).toBeOnTheScreen();
            expect(screen.queryByTestId('xero-webview')).toBeNull();
        });

        it('navigates to the 2FA route when the modal is submitted', () => {
            renderXeroSetupPage();
            act(() => mockRequire2FAProps.current?.onSubmit());

            expect(mockedGetTwoFactorAuthRoute).toHaveBeenCalled();
            expect(mockedNavigate).toHaveBeenCalledWith(TWO_FACTOR_AUTH_ROUTE);
        });

        it('navigates back without navigating to the 2FA route when the modal is cancelled', () => {
            renderXeroSetupPage();
            act(() => mockRequire2FAProps.current?.onCancel());

            expect(mockedGoBack).toHaveBeenCalled();
            expect(mockedNavigate).not.toHaveBeenCalled();
            expect(screen.queryByTestId('require-2fa-modal')).toBeNull();
        });
    });
});
