import {render} from '@testing-library/react-native';

import useSubPage from '@hooks/useSubPage';

import InternationalDepositAccountContent from '@pages/settings/Wallet/InternationalDepositAccount/InternationalDepositAccountContent';

import {updatePersonalBankAccountCurrentPage} from '@userActions/BankAccounts';

import CONST from '@src/CONST';

import type * as ReactNavigationModule from '@react-navigation/native';
import type {ComponentProps, ReactNode} from 'react';

import React from 'react';

import createMock from '../../utils/createMock';

jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: ReactNode}) =>
            children,
);
jest.mock('@hooks/useAndroidBackButtonHandler', () => jest.fn());
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useRootNavigationState', () => jest.fn(() => undefined));
jest.mock('@hooks/useSubPage', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));
jest.mock('@userActions/BankAccounts', () => ({
    clearCorpayBankAccountFields: jest.fn(),
    updatePersonalBankAccountCurrentPage: jest.fn(),
}));
jest.mock('@userActions/FormActions', () => ({
    clearDraftValues: jest.fn(),
}));

let mockIsFocused = true;
let mockCurrentPageName: string = CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationModule>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
    useRoute: () => ({params: {}}),
}));

describe('InternationalDepositAccountContent Wallet resume page', () => {
    const mockedUseSubPage = jest.mocked(useSubPage);
    const mockedUpdatePersonalBankAccountCurrentPage = jest.mocked(updatePersonalBankAccountCurrentPage);
    const props = createMock<ComponentProps<typeof InternationalDepositAccountContent>>({
        privatePersonalDetails: undefined,
        corpayFields: {
            bankCountry: 'DE',
            bankCurrency: 'EUR',
            formFields: [{id: 'accountNumber', isRequired: true, validationRules: []}],
        },
        bankAccountList: undefined,
        draftValues: {
            bankCountry: 'DE',
            bankCurrency: 'EUR',
            accountNumber: '12345678',
        },
        country: 'DE',
        isAccountLoading: false,
        isWalletSetup: true,
        savedPage: CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsFocused = true;
        mockCurrentPageName = CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION;
        mockedUseSubPage.mockImplementation(() => ({
            CurrentPage: () => null,
            isEditing: false,
            nextPage: jest.fn(),
            prevPage: jest.fn(),
            pageIndex: CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_INFORMATION,
            currentPageName: mockCurrentPageName,
            moveTo: jest.fn(),
            resetToPage: jest.fn(),
            lastPageIndex: CONST.CORPAY_FIELDS.INDEXES.MAPPING.SUCCESS,
            isRedirecting: false,
        }));
    });

    it('resumes and persists the earlier page after backward navigation', () => {
        // Given saved Wallet progress on a completed international setup
        const {rerender} = render(<InternationalDepositAccountContent {...props} />);

        // Then the saved page is preferred over the deepest page derived from completed values
        expect(mockedUseSubPage).toHaveBeenLastCalledWith(expect.objectContaining({startFrom: CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_INFORMATION}));

        // When the deeper route blurs and the earlier account-details route becomes focused again
        mockedUpdatePersonalBankAccountCurrentPage.mockClear();
        mockCurrentPageName = CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_DETAILS;
        mockIsFocused = false;
        rerender(<InternationalDepositAccountContent {...props} />);
        expect(mockedUpdatePersonalBankAccountCurrentPage).not.toHaveBeenCalled();

        mockIsFocused = true;
        rerender(<InternationalDepositAccountContent {...props} />);

        // Then the earlier focused page replaces the deepest saved resume page
        expect(mockedUpdatePersonalBankAccountCurrentPage).toHaveBeenLastCalledWith(CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_DETAILS);
    });

    it('does not resume past an incomplete required step', () => {
        // Given a saved page after Bank account details, but its required account number is missing
        const incompleteProps = {
            ...props,
            draftValues: {
                bankCountry: 'DE',
                bankCurrency: 'EUR',
                accountNumber: '',
            },
        };

        // When the Wallet setup is reopened
        render(<InternationalDepositAccountContent {...incompleteProps} />);

        // Then it resumes on the incomplete step instead of skipping forward to the saved page
        expect(mockedUseSubPage).toHaveBeenLastCalledWith(expect.objectContaining({startFrom: CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS}));
    });
});
