import {render, screen, waitFor} from '@testing-library/react-native';

import type FormWrapper from '@components/Form/FormWrapper';

import IncorporationCode from '@pages/ReimbursementAccount/USD/BusinessInfo/subSteps/IncorporationCode';

import ONYXKEYS from '@src/ONYXKEYS';

import type ReactNative from 'react-native';

import React, {act} from 'react';

import * as TestHelper from '../utils/TestHelper';

type MockFormWrapperProps = React.ComponentProps<typeof FormWrapper>;
type MockIndustryCodeSelectorProps = {value?: string};
/** The part of the reimbursement account the step reads */
type MockReimbursementAccount = {achData: {industryCode?: string}} | undefined;

const mockTranslate = TestHelper.translateLocal;
const SAVED_INDUSTRY_CODE = '111130';

const mockReimbursementAccountKey = ONYXKEYS.REIMBURSEMENT_ACCOUNT;

// The reimbursement account is controlled by the test so we can make it load after the step has mounted
let mockReimbursementAccount: MockReimbursementAccount;
let mockOnyxVersion = 0;
const mockOnyxListeners = new Set<() => void>();

jest.mock('@hooks/useOnyx', () => {
    const {useSyncExternalStore} = jest.requireActual<typeof React>('react');
    const actualUseOnyx = jest.requireActual<{default: (key: string, options?: unknown) => unknown}>('@hooks/useOnyx').default;
    const subscribe = (listener: () => void) => {
        mockOnyxListeners.add(listener);
        return () => {
            mockOnyxListeners.delete(listener);
        };
    };
    const getVersion = () => mockOnyxVersion;

    function useOnyxMock(key: string, options?: unknown) {
        useSyncExternalStore(subscribe, getVersion);
        if (key === mockReimbursementAccountKey) {
            return [mockReimbursementAccount, {status: 'loaded'}];
        }
        return actualUseOnyx(key, options);
    }

    return {__esModule: true, default: useOnyxMock};
});
jest.mock('@components/Form/FormWrapper', () => {
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({children}: MockFormWrapperProps) => <reactNative.View testID="form">{children}</reactNative.View>,
    };
});
// The real selector needs navigation focus and a list, but here we only care about the value the form passes in
jest.mock('@pages/ReimbursementAccount/USD/BusinessInfo/subSteps/IndustryCode/IndustryCodeSelector', () => {
    const reactNative = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({value}: MockIndustryCodeSelectorProps) => <reactNative.Text testID="industry-code-value">{value ?? ''}</reactNative.Text>,
    };
});
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useIsFocusedRef', () => () => ({current: true}));

function setReimbursementAccount(reimbursementAccount: MockReimbursementAccount) {
    mockReimbursementAccount = reimbursementAccount;
    mockOnyxVersion++;
    for (const listener of mockOnyxListeners) {
        listener();
    }
}

function renderIncorporationCode(isEditing: boolean) {
    render(
        <IncorporationCode
            onNext={jest.fn()}
            onMove={jest.fn()}
            isEditing={isEditing}
        />,
    );
}

describe('IncorporationCode', () => {
    beforeEach(() => {
        mockReimbursementAccount = undefined;
    });

    it('prefills the saved industry code when the user steps through Update details', async () => {
        // Given a bank account that already has an industry code saved
        setReimbursementAccount({achData: {industryCode: SAVED_INDUSTRY_CODE}});

        // When the step opens from Continue setup > Update details, which is not the edit route
        renderIncorporationCode(false);

        // Then the saved code is shown, instead of an empty field the user has to fill in again
        await waitFor(() => expect(screen.getByTestId('industry-code-value')).toHaveTextContent(SAVED_INDUSTRY_CODE));
    });

    it('prefills the saved industry code when the user edits it from the confirmation page', async () => {
        // Given a bank account that already has an industry code saved
        setReimbursementAccount({achData: {industryCode: SAVED_INDUSTRY_CODE}});

        // When the step opens from the confirmation page in edit mode
        renderIncorporationCode(true);

        // Then the saved code is still shown, so the edit flow keeps working
        await waitFor(() => expect(screen.getByTestId('industry-code-value')).toHaveTextContent(SAVED_INDUSTRY_CODE));
    });

    it('prefills the saved industry code when the reimbursement account arrives after the step has mounted', async () => {
        // Given the reimbursement account is still undefined when the step mounts, as happens while a merge to it is queued
        setReimbursementAccount(undefined);
        renderIncorporationCode(false);

        // Then the field starts empty, because there is no saved code to seed it with yet
        expect(await screen.findByTestId('industry-code-value')).toHaveTextContent('');

        // When the reimbursement account arrives with a saved industry code
        act(() => {
            setReimbursementAccount({achData: {industryCode: SAVED_INDUSTRY_CODE}});
        });

        // Then the saved code is shown, even though FormProvider only reads defaultValue on the input's first render
        await waitFor(() => expect(screen.getByTestId('industry-code-value')).toHaveTextContent(SAVED_INDUSTRY_CODE));
    });

    it('leaves the field empty when no industry code has been saved yet', async () => {
        // Given a new bank account setup without an industry code
        setReimbursementAccount({achData: {}});

        // When the step opens
        renderIncorporationCode(false);

        // Then the field is empty, so no code the user never picked is prefilled
        expect(await screen.findByTestId('industry-code-value')).toHaveTextContent('');
    });
});
