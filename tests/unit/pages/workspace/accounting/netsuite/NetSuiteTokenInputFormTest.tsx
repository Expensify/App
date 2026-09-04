import {act, render, screen} from '@testing-library/react-native';

import usePermissions from '@hooks/usePermissions';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import {shouldUseUpdateNetSuiteTokens} from '@libs/actions/connections';
import {connectPolicyToNetSuite, updateNetSuiteTokens} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';

import connectToNetSuiteOAuthSetup from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/connectToNetSuiteOAuthSetup';
import NetSuiteTokenInputForm from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/NetSuiteTokenInputForm';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {NetSuiteTokenInputForm as NetSuiteTokenInputFormType} from '@src/types/form/NetSuiteTokenInputForm';

import React from 'react';
import {View} from 'react-native';

const POLICY_ID = '123';
const ACCOUNT_ID = 'TSTDRV1234567';
const TOKEN_ID = 'token-123';
const TOKEN_SECRET = 'secret-123';
const ENVIRONMENT_URL = 'https://new.expensify.com';
const TWO_FACTOR_AUTH_ROUTE = ROUTES.SETTINGS_2FA_ENABLED;

const FORM_VALUES = {
    netSuiteAccountID: ACCOUNT_ID,
    netSuiteTokenID: TOKEN_ID,
    netSuiteTokenSecret: TOKEN_SECRET,
} as NetSuiteTokenInputFormType;

type Require2FAProps = {
    isVisible: boolean;
    onSubmit: () => void;
    onCancel: () => void;
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockView = View;

// Capture the props of the mocked children so the tests can drive submission and the modal.
type MockFormProviderProps = {
    children: React.ReactNode;
    onSubmit: (values: NetSuiteTokenInputFormType) => void;
    keyboardSubmitBehavior?: string;
    shouldShowLoadingImmediatelyOnPress?: boolean;
    submitButtonText?: string;
};

const mockFormProps: {current: Omit<MockFormProviderProps, 'children'> | undefined} = {
    current: undefined,
};
const mockRequire2FAProps: {current: Require2FAProps | undefined} = {
    current: undefined,
};

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);
jest.mock('@hooks/useEnvironment', () => () => ({
    environmentURL: 'https://new.expensify.com',
}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({
    inputCallbackRef: jest.fn(),
}));
jest.mock('@hooks/usePolicy', () => () => undefined);
jest.mock('@hooks/usePermissions');
jest.mock('@hooks/useTwoFactorAuthRoute');
jest.mock('@libs/actions/connections', () => ({
    shouldUseUpdateNetSuiteTokens: jest.fn(() => false),
}));
jest.mock('@libs/actions/connections/NetSuiteCommands', () => ({
    connectPolicyToNetSuite: jest.fn(),
    updateNetSuiteTokens: jest.fn(),
}));
jest.mock('@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/connectToNetSuiteOAuthSetup', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));
jest.mock('@components/RenderHTML', () => () => null);
jest.mock('@components/Form/FormProvider', () => {
    function MockFormProvider({children, onSubmit, keyboardSubmitBehavior, shouldShowLoadingImmediatelyOnPress, submitButtonText}: MockFormProviderProps) {
        mockFormProps.current = {onSubmit, keyboardSubmitBehavior, shouldShowLoadingImmediatelyOnPress, submitButtonText};
        return children;
    }
    return MockFormProvider;
});
jest.mock('@components/Form/InputWrapper', () => () => null);
jest.mock('@components/RequireTwoFactorAuthenticationModal', () => ({isVisible, onSubmit, onCancel}: Require2FAProps) => {
    mockRequire2FAProps.current = {isVisible, onSubmit, onCancel};
    return isVisible ? <MockView testID="require-2fa-modal" /> : null;
});

const mockedUsePermissions = jest.mocked(usePermissions);
const mockedUseTwoFactorAuthRoute = jest.mocked(useTwoFactorAuthRoute);
const mockedShouldUseUpdateNetSuiteTokens = jest.mocked(shouldUseUpdateNetSuiteTokens);
const mockedConnectPolicyToNetSuite = jest.mocked(connectPolicyToNetSuite);
const mockedUpdateNetSuiteTokens = jest.mocked(updateNetSuiteTokens);
const mockedConnectToNetSuiteOAuthSetup = jest.mocked(connectToNetSuiteOAuthSetup);
const mockedNavigate = jest.mocked(Navigation.navigate);
const mockedGetTwoFactorAuthRoute = jest.fn(() => TWO_FACTOR_AUTH_ROUTE);
const mockedOnNext = jest.fn();

function setBetaEnabled(isOAuthBetaEnabled: boolean) {
    mockedUsePermissions.mockReturnValue({
        isBetaEnabled: (beta) => beta === CONST.BETAS.NETSUITE_OAUTH && isOAuthBetaEnabled,
    } as ReturnType<typeof usePermissions>);
}

function set2FAEnabled(is2FAEnabled: boolean) {
    mockedUseTwoFactorAuthRoute.mockReturnValue({
        is2FAEnabled,
        getTwoFactorAuthRoute: mockedGetTwoFactorAuthRoute,
    });
}

function renderForm() {
    render(
        <NetSuiteTokenInputForm
            policyID={POLICY_ID}
            onNext={mockedOnNext}
            isEditing={false}
            onMove={jest.fn()}
            currentPageName={CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.CREDENTIALS}
        />,
    );
}

function submitForm() {
    act(() => mockFormProps.current?.onSubmit(FORM_VALUES));
}

describe('NetSuiteTokenInputForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFormProps.current = undefined;
        mockRequire2FAProps.current = undefined;
        mockedGetTwoFactorAuthRoute.mockReturnValue(TWO_FACTOR_AUTH_ROUTE);
        mockedShouldUseUpdateNetSuiteTokens.mockReturnValue(false);
    });

    describe('when the netSuiteOAuth beta is enabled and 2FA is enabled', () => {
        beforeEach(() => {
            setBetaEnabled(true);
            set2FAEnabled(true);
        });

        it('hands off to the OAuth setup with the policy, account ID and environment URL', () => {
            renderForm();
            submitForm();

            expect(mockedConnectToNetSuiteOAuthSetup).toHaveBeenCalledWith(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, undefined);
        });

        it('does not write the token-based credentials', () => {
            renderForm();
            submitForm();

            expect(mockedConnectPolicyToNetSuite).not.toHaveBeenCalled();
            expect(mockedUpdateNetSuiteTokens).not.toHaveBeenCalled();
        });

        it('does not advance the wizard, since the OAuth handoff dismisses the RHP itself', () => {
            renderForm();
            submitForm();

            expect(mockedOnNext).not.toHaveBeenCalled();
        });

        it('does not show the 2FA requirement modal', () => {
            renderForm();
            submitForm();

            expect(screen.queryByTestId('require-2fa-modal')).toBeNull();
        });

        it('submits synchronously so the setup link opens inside the tap gesture and is not popup-blocked', () => {
            renderForm();

            // Both FormProvider defaults defer onSubmit off the gesture: DISMISS_THEN_SUBMIT awaits a promise, and
            // the press-loading spinner defers by a macrotask. Either one lets mobile Safari block the OAuth tab.
            expect(mockFormProps.current?.keyboardSubmitBehavior).toBe(CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY);
            expect(mockFormProps.current?.shouldShowLoadingImmediatelyOnPress).toBe(false);
        });

        it('labels the submit button "Connect" rather than "Confirm"', () => {
            renderForm();

            expect(mockFormProps.current?.submitButtonText).toBe('workspace.accounting.setup');
        });
    });

    describe('when the netSuiteOAuth beta is enabled and 2FA is not enabled', () => {
        beforeEach(() => {
            setBetaEnabled(true);
            set2FAEnabled(false);
        });

        it('blocks the OAuth handoff and shows the 2FA requirement modal', () => {
            renderForm();
            submitForm();

            expect(screen.getByTestId('require-2fa-modal')).toBeOnTheScreen();
            expect(mockedConnectToNetSuiteOAuthSetup).not.toHaveBeenCalled();
        });

        it('navigates to the 2FA route when the modal is submitted', () => {
            renderForm();
            submitForm();
            expect(screen.getByTestId('require-2fa-modal')).toBeOnTheScreen();

            act(() => mockRequire2FAProps.current?.onSubmit());

            expect(mockedGetTwoFactorAuthRoute).toHaveBeenCalled();
            expect(mockedNavigate).toHaveBeenCalledWith(TWO_FACTOR_AUTH_ROUTE);
        });

        it('closes the modal without navigating when cancelled', () => {
            renderForm();
            submitForm();
            expect(screen.getByTestId('require-2fa-modal')).toBeOnTheScreen();

            act(() => mockRequire2FAProps.current?.onCancel());

            expect(mockedNavigate).not.toHaveBeenCalled();
            expect(screen.queryByTestId('require-2fa-modal')).toBeNull();
        });
    });

    describe('when the netSuiteOAuth beta is disabled', () => {
        beforeEach(() => {
            setBetaEnabled(false);
            set2FAEnabled(false);
        });

        it('writes the token-based credentials without requiring 2FA', () => {
            renderForm();
            submitForm();

            expect(mockedConnectPolicyToNetSuite).toHaveBeenCalledWith(POLICY_ID, FORM_VALUES);
            expect(mockedConnectToNetSuiteOAuthSetup).not.toHaveBeenCalled();
            expect(screen.queryByTestId('require-2fa-modal')).toBeNull();
        });

        it('advances the wizard so the RHP is dismissed', () => {
            renderForm();
            submitForm();

            expect(mockedOnNext).toHaveBeenCalled();
        });

        it('keeps the default submit behaviour, since the token flow never opens a popup', () => {
            renderForm();

            expect(mockFormProps.current?.keyboardSubmitBehavior).toBeUndefined();
            expect(mockFormProps.current?.shouldShowLoadingImmediatelyOnPress).toBe(true);
        });

        it('keeps the "Confirm" submit label, since the token flow has more steps after this one', () => {
            renderForm();

            expect(mockFormProps.current?.submitButtonText).toBe('common.confirm');
        });

        it('updates the existing tokens when the connection is being re-authenticated', () => {
            mockedShouldUseUpdateNetSuiteTokens.mockReturnValue(true);
            renderForm();
            submitForm();

            expect(mockedUpdateNetSuiteTokens).toHaveBeenCalledWith(POLICY_ID, FORM_VALUES);
            expect(mockedConnectPolicyToNetSuite).not.toHaveBeenCalled();
        });
    });
});
