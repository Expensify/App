import {act, render} from '@testing-library/react-native';

import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';

import useOnyx from '@hooks/useOnyx';

import InternationalDepositAccount from '@pages/settings/Wallet/InternationalDepositAccount';
import InternationalDepositAccountContent from '@pages/settings/Wallet/InternationalDepositAccount/InternationalDepositAccountContent';

import {clearCorpayBankAccountFields, clearCorpayFieldsError, fetchCorpayFields} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ComponentProps, ReactNode} from 'react';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/BlockingViews/FullPageErrorView', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => jest.fn(({children}: {children: ReactNode}) => children));
jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: ReactNode}) =>
            children,
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));
jest.mock('@pages/settings/Wallet/InternationalDepositAccount/InternationalDepositAccountContent', () => jest.fn(() => null));
jest.mock('@userActions/BankAccounts', () => ({
    clearCorpayBankAccountFields: jest.fn(),
    clearCorpayFieldsError: jest.fn(),
    fetchCorpayFields: jest.fn(),
}));
jest.mock('@userActions/FormActions', () => ({
    clearDraftValues: jest.fn(),
}));

describe('InternationalDepositAccount resume fields', () => {
    const mockedFullPageErrorView = jest.mocked(FullPageErrorView);
    const mockedFullPageOfflineBlockingView = jest.mocked(FullPageOfflineBlockingView);
    const mockedFullScreenLoadingIndicator = jest.mocked(FullScreenLoadingIndicator);
    const mockedHeaderWithBackButton = jest.mocked(HeaderWithBackButton);
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedInternationalDepositAccountContent = jest.mocked(InternationalDepositAccountContent);
    const mockedClearCorpayBankAccountFields = jest.mocked(clearCorpayBankAccountFields);
    const mockedClearCorpayFieldsError = jest.mocked(clearCorpayFieldsError);
    const mockedClearDraftValues = jest.mocked(clearDraftValues);
    const mockedFetchCorpayFields = jest.mocked(fetchCorpayFields);

    const draftValues = {bankCountry: 'DE', bankCurrency: 'EUR', accountNumber: '12345678'};
    const matchingCorpayFields = {
        bankCountry: 'DE',
        bankCurrency: 'EUR',
        isWithdrawal: false,
        isBusinessBankAccount: false,
        formFields: [{id: 'accountNumber'}],
    };
    const componentProps = createMock<ComponentProps<typeof InternationalDepositAccount>>({
        route: {params: {backTo: ROUTES.SETTINGS_WALLET}},
    });

    let personalBankAccount: {source: string; isLoading?: boolean; corpayFieldsError?: 'common.genericErrorMessage' | null};
    let corpayFields: typeof matchingCorpayFields | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        personalBankAccount = {source: CONST.BANK_ACCOUNT.SOURCE.WALLET, isLoading: false, corpayFieldsError: null};
        corpayFields = undefined;
        mockedUseOnyx.mockImplementation((key, options) => {
            const applySelector = <TValue,>(value: TValue) => (options?.selector ? options.selector(value) : value);
            if (key === ONYXKEYS.PERSONAL_BANK_ACCOUNT) {
                return [applySelector(personalBankAccount), {status: 'loaded'}];
            }
            if (key === ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT) {
                return [applySelector(draftValues), {status: 'loaded'}];
            }
            if (key === ONYXKEYS.CORPAY_FIELDS) {
                return [applySelector(corpayFields), {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('keeps mismatched fields out of the form until a successful refresh arrives', () => {
        // Given a Wallet draft whose personal Corpay fields are missing
        const {rerender} = render(<InternationalDepositAccount {...componentProps} />);

        // When the resume refresh starts
        expect(mockedFetchCorpayFields).toHaveBeenCalledWith('DE', 'EUR', false, false, {preserveExistingDraft: true});

        // Then a navigable, offline-aware loading state is shown without mounting the form
        expect(mockedHeaderWithBackButton).toHaveBeenCalled();
        expect(mockedFullPageOfflineBlockingView).toHaveBeenCalled();
        expect(mockedFullScreenLoadingIndicator).toHaveBeenCalled();
        expect(mockedInternationalDepositAccountContent).not.toHaveBeenCalled();

        // When matching fields arrive successfully
        corpayFields = matchingCorpayFields;
        rerender(<InternationalDepositAccount {...componentProps} />);

        // Then the form is allowed to render
        expect(mockedInternationalDepositAccountContent).toHaveBeenCalled();
    });

    it('shows a retryable error without mounting the form when refresh fails', () => {
        // Given a failed refresh for saved Wallet progress
        personalBankAccount = {...personalBankAccount, corpayFieldsError: 'common.genericErrorMessage'};

        // When the international setup opens
        render(<InternationalDepositAccount {...componentProps} />);

        // Then the user can go back or retry, and mismatched fields never reach the form
        expect(mockedHeaderWithBackButton).toHaveBeenCalled();
        expect(mockedFullPageOfflineBlockingView).toHaveBeenCalled();
        expect(mockedFullPageErrorView).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldShow: true,
                subtitle: 'common.genericErrorMessage',
                buttonTranslationKey: 'common.tryAgain',
            }),
            undefined,
        );
        expect(mockedInternationalDepositAccountContent).not.toHaveBeenCalled();

        // When the user retries
        act(() => mockedFullPageErrorView.mock.lastCall?.[0].onButtonPress?.());

        // Then the same saved country and currency are requested again
        expect(mockedFetchCorpayFields).toHaveBeenCalledWith('DE', 'EUR', false, false, {preserveExistingDraft: true});
    });

    it('clears poisoned resume state when the failed setup is abandoned', () => {
        // Given a saved country and currency whose Corpay refresh failed
        personalBankAccount = {...personalBankAccount, corpayFieldsError: 'common.genericErrorMessage'};
        render(<InternationalDepositAccount {...componentProps} />);

        // When the user presses Back instead of retrying
        act(() => mockedHeaderWithBackButton.mock.lastCall?.[0].onBackButtonPress?.());

        // Then reopening can start fresh rather than returning to the same permanent error
        expect(mockedClearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        expect(mockedClearCorpayBankAccountFields).toHaveBeenCalled();
        expect(mockedClearCorpayFieldsError).toHaveBeenCalled();
    });
});
