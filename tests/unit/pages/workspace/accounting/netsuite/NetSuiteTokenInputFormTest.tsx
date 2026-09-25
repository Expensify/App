import {act, render} from '@testing-library/react-native';

import {shouldUseUpdateNetSuiteTokens} from '@libs/actions/connections';
import {connectPolicyToNetSuite, updateNetSuiteTokens} from '@libs/actions/connections/NetSuiteCommands';

import connectToNetSuiteOAuthSetup from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/connectToNetSuiteOAuthSetup';
import NetSuiteTokenInputForm from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/NetSuiteTokenInputForm';

import CONST from '@src/CONST';
import type {NetSuiteTokenInputForm as NetSuiteTokenInputFormType} from '@src/types/form/NetSuiteTokenInputForm';

import React from 'react';

const POLICY_ID = '123';
const ACCOUNT_ID = 'TSTDRV1234567';
const TOKEN_ID = 'token-123';
const TOKEN_SECRET = 'secret-123';
const ENVIRONMENT_URL = 'https://new.expensify.com';

const FORM_VALUES = {
    netSuiteAccountID: ACCOUNT_ID,
    netSuiteTokenID: TOKEN_ID,
    netSuiteTokenSecret: TOKEN_SECRET,
} as NetSuiteTokenInputFormType;

// Capture the form props to submit credentials in tests.
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
jest.mock('@libs/actions/connections', () => ({
    shouldUseUpdateNetSuiteTokens: jest.fn(() => false),
}));
jest.mock('@libs/actions/connections/NetSuiteCommands', () => ({
    connectPolicyToNetSuite: jest.fn(),
    updateNetSuiteTokens: jest.fn(),
}));
jest.mock('@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/connectToNetSuiteOAuthSetup', () => jest.fn());
jest.mock('@components/RenderHTML', () => () => null);
jest.mock('@components/Form/FormProvider', () => {
    function MockFormProvider({children, onSubmit, keyboardSubmitBehavior, shouldShowLoadingImmediatelyOnPress, submitButtonText}: MockFormProviderProps) {
        mockFormProps.current = {onSubmit, keyboardSubmitBehavior, shouldShowLoadingImmediatelyOnPress, submitButtonText};
        return children;
    }
    return MockFormProvider;
});
jest.mock('@components/Form/InputWrapper', () => () => null);

const mockedShouldUseUpdateNetSuiteTokens = jest.mocked(shouldUseUpdateNetSuiteTokens);
const mockedConnectPolicyToNetSuite = jest.mocked(connectPolicyToNetSuite);
const mockedUpdateNetSuiteTokens = jest.mocked(updateNetSuiteTokens);
const mockedConnectToNetSuiteOAuthSetup = jest.mocked(connectToNetSuiteOAuthSetup);
const mockedOnNext = jest.fn();

function renderForm(isOAuthFlow: boolean) {
    render(
        <NetSuiteTokenInputForm
            policyID={POLICY_ID}
            onNext={mockedOnNext}
            isEditing={false}
            onMove={jest.fn()}
            currentPageName={CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.CREDENTIALS}
            isOAuthFlow={isOAuthFlow}
            shouldShowTokenAuthenticationLink={false}
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
        mockedShouldUseUpdateNetSuiteTokens.mockReturnValue(false);
    });

    describe('in the OAuth flow', () => {
        it('hands off to the OAuth setup with the policy, account ID and environment URL', () => {
            renderForm(true);
            submitForm();

            expect(mockedConnectToNetSuiteOAuthSetup).toHaveBeenCalledWith(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL);
        });

        it('does not write the token-based credentials', () => {
            renderForm(true);
            submitForm();

            expect(mockedConnectPolicyToNetSuite).not.toHaveBeenCalled();
            expect(mockedUpdateNetSuiteTokens).not.toHaveBeenCalled();
        });

        it('does not advance the wizard, since the OAuth handoff dismisses the RHP itself', () => {
            renderForm(true);
            submitForm();

            expect(mockedOnNext).not.toHaveBeenCalled();
        });

        it('submits synchronously so the setup link opens inside the tap gesture and is not popup-blocked', () => {
            renderForm(true);

            // Both FormProvider defaults defer onSubmit off the gesture: DISMISS_THEN_SUBMIT awaits a promise, and
            // the press-loading spinner defers by a macrotask. Either one lets mobile Safari block the OAuth tab.
            expect(mockFormProps.current?.keyboardSubmitBehavior).toBe(CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY);
            expect(mockFormProps.current?.shouldShowLoadingImmediatelyOnPress).toBe(false);
        });

        it('labels the submit button "Connect" rather than "Confirm"', () => {
            renderForm(true);

            expect(mockFormProps.current?.submitButtonText).toBe('workspace.accounting.setup');
        });
    });

    describe('in the token-based authentication flow', () => {
        it('writes the token-based credentials', () => {
            renderForm(false);
            submitForm();

            expect(mockedConnectPolicyToNetSuite).toHaveBeenCalledWith(POLICY_ID, FORM_VALUES);
            expect(mockedConnectToNetSuiteOAuthSetup).not.toHaveBeenCalled();
        });

        it('advances the wizard so the RHP is dismissed', () => {
            renderForm(false);
            submitForm();

            expect(mockedOnNext).toHaveBeenCalled();
        });

        it('keeps the default submit behaviour, since the token flow never opens a popup', () => {
            renderForm(false);

            expect(mockFormProps.current?.keyboardSubmitBehavior).toBeUndefined();
            expect(mockFormProps.current?.shouldShowLoadingImmediatelyOnPress).toBe(true);
        });

        it('keeps the "Confirm" submit label, since the token flow has more steps after this one', () => {
            renderForm(false);

            expect(mockFormProps.current?.submitButtonText).toBe('common.confirm');
        });

        it('updates the existing tokens when the connection is being re-authenticated', () => {
            mockedShouldUseUpdateNetSuiteTokens.mockReturnValue(true);
            renderForm(false);
            submitForm();

            expect(mockedUpdateNetSuiteTokens).toHaveBeenCalledWith(POLICY_ID, FORM_VALUES);
            expect(mockedConnectPolicyToNetSuite).not.toHaveBeenCalled();
        });
    });
});
