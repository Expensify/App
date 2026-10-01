import {act, render, screen} from '@testing-library/react-native';

import FormDraftPersistenceContext from '@components/Form/FormDraftPersistenceContext';
import Text from '@components/Text';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';

import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import InternationalDepositAccountContent from '@pages/settings/Wallet/InternationalDepositAccount/InternationalDepositAccountContent';
import CountrySelection from '@pages/settings/Wallet/InternationalDepositAccount/subPages/CountrySelection';

import {
    cancelPersonalBankAccountEdit,
    clearInternationalBankAccount,
    clearPersonalBankAccount,
    clearPersonalBankAccountPreservingEntryContext,
    fetchCorpayFields,
    updatePersonalBankAccountCurrentPage,
} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type * as ReactNavigationModule from '@react-navigation/native';
import type {ComponentProps, ReactNode} from 'react';

import React, {useContext} from 'react';

import createMock from '../../utils/createMock';

jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@pages/settings/Wallet/CountrySelectionList', () => jest.fn(() => null));
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
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useSubPage', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@userActions/BankAccounts', () => ({
    cancelPersonalBankAccountEdit: jest.fn(),
    clearCorpayBankAccountFields: jest.fn(),
    clearInternationalBankAccount: jest.fn(),
    clearPersonalBankAccount: jest.fn(),
    clearPersonalBankAccountPreservingEntryContext: jest.fn(),
    fetchCorpayFields: jest.fn(),
    finishPersonalBankAccountEdit: jest.fn(),
    startPersonalBankAccountEdit: jest.fn(),
    updatePersonalBankAccountCurrentPage: jest.fn(),
}));
jest.mock('@userActions/FormActions', () => ({
    clearDraftValues: jest.fn(),
}));

let mockIsFocused = true;
let mockIsEditing = false;
let mockCurrentPageName: string = CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION;
let mockPageIndex: number = CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_INFORMATION;
let mockBackButtonHandler: (() => boolean) | undefined;
const DRAFT_PERSISTENCE_TEST_ID = 'draft-persistence';

function MockCurrentPage() {
    const shouldPersistDraft = useContext(FormDraftPersistenceContext);
    return <Text testID={DRAFT_PERSISTENCE_TEST_ID}>{String(shouldPersistDraft)}</Text>;
}

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationModule>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
    useRoute: () => ({params: {action: mockIsEditing ? 'edit' : undefined}}),
}));

describe('InternationalDepositAccountContent Wallet resume page', () => {
    const mockedUseSubPage = jest.mocked(useSubPage);
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedCountrySelectionList = jest.mocked(CountrySelectionList);
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
        mockPageIndex = CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_INFORMATION;
        mockBackButtonHandler = undefined;
        mockedUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.ACCOUNT) {
                return [true, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.PERSONAL_BANK_ACCOUNT) {
                return [{source: CONST.BANK_ACCOUNT.SOURCE.WALLET}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
        jest.mocked(useAndroidBackButtonHandler).mockImplementation((callback) => {
            mockBackButtonHandler = callback;
        });
        mockedUseSubPage.mockImplementation(() => ({
            CurrentPage: MockCurrentPage,
            isEditing: mockIsEditing,
            nextPage: jest.fn(),
            prevPage: jest.fn(),
            pageIndex: mockPageIndex,
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
        expect(screen.getByTestId(DRAFT_PERSISTENCE_TEST_ID)).toHaveTextContent('true');

        // When the same page is rendered outside Wallet
        rerender(
            <InternationalDepositAccountContent
                {...props}
                isWalletSetup={false}
            />,
        );

        // Then the existing non-Wallet edit behavior remains unchanged
        expect(screen.getByTestId(DRAFT_PERSISTENCE_TEST_ID)).toHaveTextContent('false');

        // When Wallet edits a page that already owns its persistence behavior
        mockCurrentPageName = CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_TYPE;
        rerender(<InternationalDepositAccountContent {...props} />);

        // Then the shared context does not broaden that page's behavior
        expect(screen.getByTestId(DRAFT_PERSISTENCE_TEST_ID)).toHaveTextContent('false');
    });

    it('restores the pre-edit non-USD draft when Back cancels an edit', () => {
        // Given the flow was reopened on an edit RHP with an unconfirmed value and its pre-edit snapshot
        mockIsEditing = true;
        mockCurrentPageName = CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION;
        const editDraftSnapshot = {
            pageName: CONST.CORPAY_FIELDS.PAGE_NAME.BANK_INFORMATION,
            internationalBankAccountDraft: {
                bankCountry: 'DE',
                bankCurrency: 'EUR',
                bankName: 'Original bank',
            },
        };
        render(
            <InternationalDepositAccountContent
                {...props}
                savedPageAction="edit"
                editDraftSnapshot={editDraftSnapshot}
                draftValues={{bankCountry: 'DE', bankCurrency: 'EUR', accountNumber: '12345678', bankName: 'Unconfirmed bank'}}
            />,
        );

        // When the user presses Back without confirming the edit
        mockBackButtonHandler?.();

        // Then the saved pre-edit values are restored before returning to confirmation
        expect(cancelPersonalBankAccountEdit).toHaveBeenCalledWith(editDraftSnapshot, CONST.CORPAY_FIELDS.PAGE_NAME.CONFIRM);
    });

    it('returns to the bank-account purpose chooser when leaving the first Wallet page', () => {
        // Given a Wallet personal setup is on its first non-USD country page
        mockCurrentPageName = CONST.CORPAY_FIELDS.PAGE_NAME.COUNTRY;
        mockPageIndex = CONST.CORPAY_FIELDS.INDEXES.MAPPING.COUNTRY_SELECTOR;
        render(<InternationalDepositAccountContent {...props} />);

        // When the user presses Back to explicitly abandon that setup
        mockBackButtonHandler?.();

        // Then its personal setup state is cleared and the purpose chooser is shown
        expect(clearPersonalBankAccount).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
    });

    it('preserves international values when briefly switching to the US flow', () => {
        // Given a completed non-US setup whose country is being edited
        const onNext = jest.fn();
        const onMove = jest.fn();
        render(
            <CountrySelection
                {...createMock<ComponentProps<typeof CountrySelection>>({
                    isEditing: true,
                    onNext,
                    onMove,
                    formValues: {bankCountry: 'DE', bankCurrency: 'EUR', accountNumber: '12345678'},
                    fieldsMap: {[CONST.CORPAY_FIELDS.PAGE_NAME.ACCOUNT_DETAILS]: {accountNumber: {}}},
                })}
            />,
        );

        // When the user selects the US, returns with Back, and selects the original country again
        act(() => mockedCountrySelectionList.mock.lastCall?.[0]?.onCountrySelected(CONST.COUNTRY.US));
        act(() => mockedCountrySelectionList.mock.lastCall?.[0]?.onConfirm());
        act(() => mockedCountrySelectionList.mock.lastCall?.[0]?.onCountrySelected('DE'));
        act(() => mockedCountrySelectionList.mock.lastCall?.[0]?.onConfirm());

        // Then the non-US data is retained and the flow returns to its previously completed step
        expect(clearInternationalBankAccount).not.toHaveBeenCalled();
        expect(clearPersonalBankAccountPreservingEntryContext).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT_ENTRY_POINT);
        expect(fetchCorpayFields).not.toHaveBeenCalled();
        expect(onMove).not.toHaveBeenCalled();
        expect(onNext).toHaveBeenCalledTimes(1);
    });
});
