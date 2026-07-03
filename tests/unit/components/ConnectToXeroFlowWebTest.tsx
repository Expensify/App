import type ConnectToXeroFlowType from '@components/ConnectToXeroFlow';

import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';

import {openLink} from '@userActions/Link';

import ROUTES from '@src/ROUTES';

import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.tsx` extension) to exercise the web implementation.
const connectToXeroFlowModule: unknown = require('@components/ConnectToXeroFlow/index.tsx');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const ConnectToXeroFlow = (connectToXeroFlowModule as {default: typeof ConnectToXeroFlowType}).default;

const ENVIRONMENT_URL = 'https://new.expensify.com';
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
}));
jest.mock('@components/RequireTwoFactorAuthenticationModal', () => ({isVisible, onSubmit, onCancel}: Require2FAProps) => {
    mockRequire2FAProps.current = {isVisible, onSubmit, onCancel};
    return isVisible ? <MockView testID="require-2fa-modal" /> : null;
});

const mockedUseTwoFactorAuthRoute = jest.mocked(useTwoFactorAuthRoute);
const mockedGetXeroSetupLink = jest.mocked(getXeroSetupLink);
const mockedOpenLink = jest.mocked(openLink);
const mockedClose = jest.mocked(close);
const mockedNavigate = jest.mocked(Navigation.navigate);
const mockedGetTwoFactorAuthRoute = jest.fn(() => TWO_FACTOR_AUTH_ROUTE);

describe('ConnectToXeroFlow (web)', () => {
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

        it('opens the Xero setup link inline on mount without showing the 2FA modal', () => {
            render(<ConnectToXeroFlow policyID={POLICY_ID} />);

            expect(mockedGetXeroSetupLink).toHaveBeenCalledWith(POLICY_ID);
            expect(mockedOpenLink).toHaveBeenCalledWith(`https://xero-setup.example/${POLICY_ID}`, ENVIRONMENT_URL);
            expect(screen.queryByTestId('require-2fa-modal')).toBeNull();
        });

        it('does not navigate to a setup screen', () => {
            render(<ConnectToXeroFlow policyID={POLICY_ID} />);

            expect(mockedNavigate).not.toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_XERO_SETUP.getRoute(POLICY_ID));
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
            render(<ConnectToXeroFlow policyID={POLICY_ID} />);

            expect(screen.getByTestId('require-2fa-modal')).toBeOnTheScreen();
            expect(mockedOpenLink).not.toHaveBeenCalled();
        });

        it('closes the modal and navigates to the 2FA route when submitted', () => {
            // The component calls `close(callback)`; invoke the callback to simulate the modal finishing closing.
            mockedClose.mockImplementation((callback) => {
                callback?.();
            });
            render(<ConnectToXeroFlow policyID={POLICY_ID} />);
            act(() => mockRequire2FAProps.current?.onSubmit());

            expect(mockedClose).toHaveBeenCalled();
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
