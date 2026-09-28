import {render} from '@testing-library/react-native';

import FormDraftPersistenceContext from '@components/Form/FormDraftPersistenceContext';

import useSubPage from '@hooks/useSubPage';

import InternationalDepositAccountContent from '@pages/settings/Wallet/InternationalDepositAccount/InternationalDepositAccountContent';

import {updatePersonalBankAccountCurrentPage} from '@userActions/BankAccounts';

import CONST from '@src/CONST';

import type * as ReactNavigationModule from '@react-navigation/native';
import type {ComponentProps, ReactNode} from 'react';

import React, {useContext} from 'react';

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
let mockIsEditing = false;
let mockCurrentPageName: string = CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION;
let mockShouldPersistDraft = false;
const MockCurrentPage = jest.fn(function MockCurrentPage() {
    mockShouldPersistDraft = useContext(FormDraftPersistenceContext);
    return null;
});

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationModule>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
    useRoute: () => ({params: {action: mockIsEditing ? 'edit' : undefined}}),
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
        mockIsEditing = false;
        mockCurrentPageName = CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION;
        mockShouldPersistDraft = false;
        mockedUseSubPage.mockImplementation(() => ({
            CurrentPage: MockCurrentPage,
            isEditing: mockIsEditing,
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
        expect(mockedUpdatePersonalBankAccountCurrentPage).toHaveBeenLastCalledWith(CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_DETAILS, undefined);
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

    it('restores edit mode when the saved edit page is still safe to resume', () => {
        // Given the Wallet flow was dismissed while editing Bank information from confirmation
        mockIsEditing = true;
        const editProps = {
            ...props,
            savedPageAction: 'edit' as const,
        };

        // When the international flow is reopened
        render(<InternationalDepositAccountContent {...editProps} />);

        // Then the saved page starts in edit mode and remains the persisted resume route
        expect(mockedUseSubPage).toHaveBeenLastCalledWith(
            expect.objectContaining({
                startFrom: CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_INFORMATION,
                startAction: 'edit',
            }),
        );
        expect(mockedUpdatePersonalBankAccountCurrentPage).toHaveBeenLastCalledWith(CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION, 'edit');
    });

    it('restores an explicitly edited account-holder page that forward navigation would skip', () => {
        // Given profile data normally allows the account-holder page to be skipped, but the user dismissed while editing that page
        mockIsEditing = true;
        mockCurrentPageName = CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_HOLDER_DETAILS;
        const accountHolderEditProps = createMock<ComponentProps<typeof InternationalDepositAccountContent>>({
            ...props,
            privatePersonalDetails: {
                legalFirstName: 'Alberta',
                legalLastName: 'Charleson',
            },
            corpayFields: {
                bankCountry: 'DE',
                bankCurrency: 'EUR',
                formFields: [
                    {id: 'accountNumber', isRequired: true, validationRules: []},
                    {id: 'accountHolderName', isRequired: true, validationRules: []},
                ],
            },
            draftValues: {
                bankCountry: 'DE',
                bankCurrency: 'EUR',
                accountNumber: '12345678',
                accountHolderName: 'Alberta Charleson4',
            },
            savedPage: CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_HOLDER_DETAILS,
            savedPageAction: 'edit',
        });

        // When the Wallet setup is reopened
        render(<InternationalDepositAccountContent {...accountHolderEditProps} />);

        // Then the explicit edit route wins over the normal forward-navigation skip
        expect(mockedUseSubPage).toHaveBeenLastCalledWith(
            expect.objectContaining({
                startFrom: CONST.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_HOLDER_INFORMATION,
                startAction: 'edit',
                skipPages: expect.arrayContaining([CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_HOLDER_DETAILS]),
            }),
        );
    });

    it('persists in-progress edits only for Wallet setup', () => {
        // Given an international bank-information edit is opened from Wallet
        mockIsEditing = true;
        const {rerender} = render(<InternationalDepositAccountContent {...props} />);

        // Then its inputs are allowed to save edits before the user confirms them
        expect(mockShouldPersistDraft).toBe(true);

        // When the same page is rendered outside Wallet
        rerender(
            <InternationalDepositAccountContent
                {...props}
                isWalletSetup={false}
            />,
        );

        // Then the existing non-Wallet edit behavior remains unchanged
        expect(mockShouldPersistDraft).toBe(false);

        // When Wallet edits a page that already owns its persistence behavior
        mockCurrentPageName = CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_TYPE;
        rerender(<InternationalDepositAccountContent {...props} />);

        // Then the shared context does not broaden that page's behavior
        expect(mockShouldPersistDraft).toBe(false);
    });
});
