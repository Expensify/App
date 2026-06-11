import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import type XeroSetupPageType from '@pages/workspace/accounting/xero/XeroSetupPage';
import {openLink} from '@userActions/Link';
import ROUTES from '@src/ROUTES';

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.tsx` extension) to exercise the web implementation.
// eslint-disable-next-line import/extensions
const XeroSetupPage = (require('@pages/workspace/accounting/xero/XeroSetupPage/index.tsx') as {default: typeof XeroSetupPageType}).default;

const ENVIRONMENT_URL = 'https://new.expensify.com';
const TWO_FACTOR_AUTH_ROUTE = ROUTES.SETTINGS_2FA_ENABLED;
const POLICY_ID = '123';

type Require2FAProps = {
    isVisible: boolean;
    onSubmit: () => void;
    onCancel: () => void;
};

// Capture the props the mocked modal renders with so we can drive them from the tests.
const mockRequire2FAProps: {current: Require2FAProps | undefined} = {
    current: undefined,
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockView = View;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useEnvironment', () => () => ({
    environmentURL: 'https://new.expensify.com',
}));
jest.mock('@hooks/useTwoFactorAuthRoute');
jest.mock('@libs/actions/connections/Xero', () => ({
    getXeroSetupLink: jest.fn((policyID: string) => `https://xero-setup.example/${policyID}`),
}));
jest.mock('@libs/actions/Modal', () => ({
    close: jest.fn(),
}));
jest.mock('@userActions/Link', () => ({
    openLink: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
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
const mockedClose = jest.mocked(close);
const mockedOpenLink = jest.mocked(openLink);
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

describe('XeroSetupPage (web)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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

        it('opens the Xero setup link for the given policy in the current environment', () => {
            renderXeroSetupPage();

            expect(mockedGetXeroSetupLink).toHaveBeenCalledWith(POLICY_ID);
            expect(mockedOpenLink).toHaveBeenCalledWith(`https://xero-setup.example/${POLICY_ID}`, ENVIRONMENT_URL);
        });

        it('navigates back after opening the setup link', () => {
            renderXeroSetupPage();

            expect(mockedGoBack).toHaveBeenCalled();
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

        it('renders the 2FA requirement modal instead of opening the setup link', () => {
            renderXeroSetupPage();

            expect(screen.getByTestId('require-2fa-modal')).toBeOnTheScreen();
            expect(mockedOpenLink).not.toHaveBeenCalled();
        });

        it('closes the modal and navigates to the 2FA route when submitted', () => {
            // The component calls `close(callback)`; invoke the callback to simulate the modal finishing closing.
            mockedClose.mockImplementation((callback) => {
                callback?.();
            });
            renderXeroSetupPage();
            act(() => mockRequire2FAProps.current?.onSubmit());

            expect(mockedClose).toHaveBeenCalled();
            expect(mockedGetTwoFactorAuthRoute).toHaveBeenCalled();
            expect(mockedNavigate).toHaveBeenCalledWith(TWO_FACTOR_AUTH_ROUTE);
        });

        it('navigates back without navigating to the 2FA route when cancelled', () => {
            renderXeroSetupPage();
            act(() => mockRequire2FAProps.current?.onCancel());

            expect(mockedGoBack).toHaveBeenCalled();
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });
});
