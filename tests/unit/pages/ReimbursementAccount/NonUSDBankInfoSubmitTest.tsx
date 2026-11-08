import {render} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';

import BankInfo from '@pages/ReimbursementAccount/NonUSD/BankInfo/BankInfo';

import {createCorpayBankAccount, getCorpayBankAccountFields, hideBankAccountErrors} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {CorpayFields, ReimbursementAccount} from '@src/types/onyx';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';

import type {ReactNode} from 'react';

import createMock from '../../../utils/createMock';

const POLICY_ID = 'policy-1';

/** Onyx values handed to `useOnyx`, keyed by the Onyx key the component reads. */
const mockOnyxValues: Record<string, unknown> = {};

/** Props `BankInfo` passes to `useSubPage`; `onFinished` is the Confirm handler of the last sub page. */
const mockSubPageProps: Array<{onFinished: () => void}> = [];

/** Props `BankInfo` passes to the step wrapper; `handleBackButtonPress` is the header back handler. */
const mockStepWrapperProps: Array<{handleBackButtonPress: () => void}> = [];

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn((key: string) => [mockOnyxValues[key]]),
}));

jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: jest.fn()}));

jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));

jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {goBack: jest.fn(), navigate: jest.fn(), setParams: jest.fn()}}));

jest.mock('@pages/ErrorPage/NotFoundPage', () => ({__esModule: true, default: () => null}));

jest.mock('@components/FullscreenLoadingIndicator', () => ({__esModule: true, default: () => null}));

jest.mock('@components/InteractiveStepWrapper', () => ({
    __esModule: true,
    default: (props: {children?: ReactNode; handleBackButtonPress: () => void}) => {
        mockStepWrapperProps.push(props);
        return props.children ?? null;
    },
}));

// Only the wiring of the Confirm handler matters here, so the sub page machinery is stubbed out and the
// `onFinished` callback BankInfo registers is captured instead.
jest.mock('@hooks/useSubPage', () => ({
    __esModule: true,
    default: jest.fn((props: {pages: Array<{pageName: string}>; onFinished: () => void}) => {
        mockSubPageProps.push(props);
        return {
            CurrentPage: () => null,
            isEditing: false,
            currentPageName: props.pages.at(-1)?.pageName,
            pageIndex: props.pages.length - 1,
            nextPage: jest.fn(),
            prevPage: jest.fn(),
            moveTo: jest.fn(),
            resetToPage: jest.fn(),
            lastPageIndex: props.pages.length - 1,
            isRedirecting: false,
        };
    }),
}));

jest.mock('@userActions/BankAccounts', () => ({
    __esModule: true,
    createCorpayBankAccount: jest.fn(),
    getCorpayBankAccountFields: jest.fn(),
    clearReimbursementAccountBankCreation: jest.fn(),
    hideBankAccountErrors: jest.fn(),
}));

jest.mock('@userActions/FormActions', () => ({__esModule: true, clearErrors: jest.fn()}));

const mockCreateCorpayBankAccount = jest.mocked(createCorpayBankAccount);
const mockGetCorpayBankAccountFields = jest.mocked(getCorpayBankAccountFields);
const mockHideBankAccountErrors = jest.mocked(hideBankAccountErrors);

const CORPAY_FIELDS = createMock<CorpayFields>({
    bankCountry: 'DE',
    bankCurrency: CONST.CURRENCY.EUR,
    formFields: [
        {id: INPUT_IDS.BANK_INFO_STEP.ACCOUNT_NUMBER, label: 'Account number', isRequired: true, validationRules: []},
        {id: INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_NAME, label: 'Account holder name', isRequired: true, validationRules: []},
    ],
    isLoading: false,
    isSuccess: true,
});

const DRAFT_VALUES = {
    [INPUT_IDS.ADDITIONAL_DATA.COUNTRY]: 'DE',
    currency: CONST.CURRENCY.EUR,
    [INPUT_IDS.BANK_INFO_STEP.ACCOUNT_NUMBER]: '12345678',
    [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_NAME]: 'Jane Doe',
};

const POLICY = {id: POLICY_ID, outputCurrency: CONST.CURRENCY.EUR};

const CREATED_ACH_DATA = createMock<ACHDataReimbursementAccount>({bankAccountID: 1234, created: '2026-01-01 00:00:00', policyID: POLICY_ID});

type RenderOptions = {
    achData?: ACHDataReimbursementAccount;
    isCreateCorpayBankAccount?: boolean;
    /** Whether the Corpay field schema for this country and currency is already loaded */
    isSchemaLoaded?: boolean;
};

function renderBankInfo({achData, isCreateCorpayBankAccount, isSchemaLoaded = true}: RenderOptions = {}) {
    const onSubmit = jest.fn();
    mockOnyxValues[ONYXKEYS.REIMBURSEMENT_ACCOUNT] = {
        achData,
        isCreateCorpayBankAccount,
        isLoading: false,
    } satisfies Partial<ReimbursementAccount>;
    mockOnyxValues[ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT] = DRAFT_VALUES;
    mockOnyxValues[ONYXKEYS.CORPAY_FIELDS] = isSchemaLoaded ? CORPAY_FIELDS : undefined;
    mockOnyxValues[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`] = POLICY;

    render(
        <BankInfo
            onSubmit={onSubmit}
            onBackButtonPress={jest.fn()}
            policyID={POLICY_ID}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
        />,
    );

    const subPageProps = mockSubPageProps.at(-1);
    const stepWrapperProps = mockStepWrapperProps.at(-1);
    if (!subPageProps || !stepWrapperProps) {
        throw new Error('Expected BankInfo to wire up its sub pages and step wrapper');
    }

    return {onSubmit, confirm: subPageProps.onFinished, pressBack: stepWrapperProps.handleBackButtonPress};
}

describe('NonUSD BankInfo Confirm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubPageProps.length = 0;
        mockStepWrapperProps.length = 0;
    });

    it('advances the flow instead of creating the bank account again once it exists', () => {
        // Given the Corpay bank account was already created and the user came back to Bank info
        const {onSubmit, confirm} = renderBankInfo({achData: CREATED_ACH_DATA});

        // When the user presses Confirm again
        confirm();

        // Then no duplicate create is sent, because the server rejects it and its reply replaces the visible error
        expect(mockCreateCorpayBankAccount).not.toHaveBeenCalled();
        // And the flow moves on to the next step, matching where a resumed setup starts
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('creates the bank account on the first Confirm', () => {
        // Given no bank account exists yet for this workspace
        const {onSubmit, confirm} = renderBankInfo();

        // When the user presses Confirm
        confirm();

        // Then the create request carries the drafted values and the flow policy
        expect(mockCreateCorpayBankAccount).toHaveBeenCalledTimes(1);
        expect(mockCreateCorpayBankAccount).toHaveBeenCalledWith(
            expect.objectContaining({[INPUT_IDS.BANK_INFO_STEP.ACCOUNT_NUMBER]: '12345678', [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_NAME]: 'Jane Doe'}),
            POLICY_ID,
        );
        // And the flow only advances after the server answers
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not stack a second create while the first one is still in flight', () => {
        // Given a create for this workspace is already pending
        const {onSubmit, confirm} = renderBankInfo({isCreateCorpayBankAccount: true});

        // When the user presses Confirm again
        confirm();

        // Then nothing is re-sent and the flow is not advanced twice
        expect(mockCreateCorpayBankAccount).not.toHaveBeenCalled();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('treats a missing reimbursement account as a first-time create', () => {
        // Given the reimbursement account has not hydrated yet
        const {confirm} = renderBankInfo({achData: undefined});

        // When the user presses Confirm
        confirm();

        // Then the create is still attempted rather than silently swallowed
        expect(mockCreateCorpayBankAccount).toHaveBeenCalledTimes(1);
    });

    it('clears the server error left by a failed Confirm when leaving the step', () => {
        // Given a failed Confirm put its message on the reimbursement account, where the sub step renders it
        const {pressBack} = renderBankInfo({achData: CREATED_ACH_DATA});

        // When the user goes back to change the details
        pressBack();

        // Then that now-stale message is cleared instead of being shown again on the next visit
        expect(mockHideBankAccountErrors).toHaveBeenCalledTimes(1);
    });

    it('keeps the loaded Corpay schema when the network reconnects', () => {
        // Given the schema for the selected country and currency is already loaded
        renderBankInfo();
        mockGetCorpayBankAccountFields.mockClear();

        // When the network reconnects mid-flow
        jest.mocked(useNetwork).mock.calls.at(-1)?.at(0)?.onReconnect?.();

        // Then the schema is not reset to its loading state under the confirmation sub step
        expect(mockGetCorpayBankAccountFields).not.toHaveBeenCalled();
    });

    it('fetches the Corpay schema again on reconnect when it is missing', () => {
        // Given no schema is loaded for the selected country and currency
        renderBankInfo({isSchemaLoaded: false});

        // When the network reconnects
        jest.mocked(useNetwork).mock.calls.at(-1)?.at(0)?.onReconnect?.();

        // Then the missing schema is fetched so the flow can continue
        expect(mockGetCorpayBankAccountFields).toHaveBeenCalledWith('DE', CONST.CURRENCY.EUR);
    });
});
