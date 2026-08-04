import {act, render, screen} from '@testing-library/react-native';

import ConnectToXeroFlow from '@components/ConnectToXeroFlow/index.native';

import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

const TWO_FACTOR_AUTH_ROUTE = ROUTES.SETTINGS_2FA_ENABLED;
const POLICY_ID = '123';

type Require2FAProps = {
    isVisible: boolean;
    onSubmit: () => void;
    onCancel: () => void;
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockView = View;

// Capture the props the mocked modal renders with so the tests can drive them.
const mockRequire2FAProps: {current: Require2FAProps | undefined} = {
    current: undefined,
};

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useTwoFactorAuthRoute');
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));
jest.mock('@components/RequireTwoFactorAuthenticationModal', () => ({isVisible, onSubmit, onCancel}: Require2FAProps) => {
    mockRequire2FAProps.current = {isVisible, onSubmit, onCancel};
    return isVisible ? <MockView testID="require-2fa-modal" /> : null;
});

const mockedUseTwoFactorAuthRoute = jest.mocked(useTwoFactorAuthRoute);
const mockedNavigate = jest.mocked(Navigation.navigate);
const mockedGetTwoFactorAuthRoute = jest.fn(() => TWO_FACTOR_AUTH_ROUTE);

describe('ConnectToXeroFlow (native)', () => {
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

        it('navigates to the Xero setup page on mount without showing the 2FA modal', () => {
            render(<ConnectToXeroFlow policyID={POLICY_ID} />);

            expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_XERO_SETUP.getRoute(POLICY_ID));
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

        it('renders the 2FA requirement modal instead of navigating to the setup page', () => {
            render(<ConnectToXeroFlow policyID={POLICY_ID} />);

            expect(screen.getByTestId('require-2fa-modal')).toBeOnTheScreen();
            expect(mockedNavigate).not.toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_XERO_SETUP.getRoute(POLICY_ID));
        });

        it('navigates to the 2FA route when the modal is submitted', () => {
            render(<ConnectToXeroFlow policyID={POLICY_ID} />);
            act(() => mockRequire2FAProps.current?.onSubmit());

            expect(mockedGetTwoFactorAuthRoute).toHaveBeenCalled();
            expect(mockedNavigate).toHaveBeenCalledWith(TWO_FACTOR_AUTH_ROUTE);
        });

        it('closes the modal without navigating when cancelled', () => {
            render(<ConnectToXeroFlow policyID={POLICY_ID} />);
            act(() => mockRequire2FAProps.current?.onCancel());

            expect(mockedNavigate).not.toHaveBeenCalled();
            expect(screen.queryByTestId('require-2fa-modal')).toBeNull();
        });
    });
});
