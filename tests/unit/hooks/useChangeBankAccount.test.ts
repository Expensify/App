import {act, renderHook} from '@testing-library/react-native';

import useChangeBankAccount from '@hooks/useChangeBankAccount';
import usePermissions from '@hooks/usePermissions';

import Navigation from '@navigation/Navigation';

import {navigateToBankAccountRoute, prepareNewBankAccountSetup} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/usePermissions');

function mockIsBetaEnabled(enabledBetas: string[]) {
    jest.mocked(usePermissions).mockReturnValue(createMock<ReturnType<typeof usePermissions>>({isBetaEnabled: (beta) => enabledBetas.includes(beta)}));
}

jest.mock('@navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

jest.mock('@userActions/ReimbursementAccount', () => ({
    __esModule: true,
    prepareNewBankAccountSetup: jest.fn(),
    navigateToBankAccountRoute: jest.fn(),
}));

const POLICY_ID = '1';
const CURRENCY = CONST.CURRENCY.USD;
const CURRENT_BANK_ACCOUNT_ID = 999;

const mockNavigate = jest.mocked(Navigation.navigate);
const mockPrepareNewBankAccountSetup = jest.mocked(prepareNewBankAccountSetup);
const mockNavigateToBankAccountRoute = jest.mocked(navigateToBankAccountRoute);

function buildBusinessBankAccount(methodID: number) {
    return {
        methodID,
        bankCurrency: CURRENCY,
        bankCountry: 'US',
        accountData: {
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
        },
    };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/naming-convention
const OTHER_ELIGIBLE_BANK_ACCOUNT_LIST = {'111': buildBusinessBankAccount(111)} as unknown as BankAccountList;
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const CURRENT_ONLY_BANK_ACCOUNT_LIST = {[`${CURRENT_BANK_ACCOUNT_ID}`]: buildBusinessBankAccount(CURRENT_BANK_ACCOUNT_ID)} as unknown as BankAccountList;

async function setBankAccountList(bankAccountList: BankAccountList) {
    await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
    await waitForBatchedUpdates();
}

describe('useChangeBankAccount', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        mockIsBetaEnabled([]);
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('opens the existing-account picker when there are other eligible business bank accounts', async () => {
        // The current account (999) plus another eligible open business account with a different methodID.
        await setBankAccountList(OTHER_ELIGIBLE_BANK_ACCOUNT_LIST);

        const {result} = renderHook(() => useChangeBankAccount(POLICY_ID, CURRENCY, CURRENT_BANK_ACCOUNT_ID));
        await waitForBatchedUpdates();

        act(() => result.current());

        expect(mockNavigate).toHaveBeenCalledWith(
            ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(POLICY_ID, undefined, CONST.BANK_ACCOUNT.CONNECT_EXISTING_SOURCE.CHANGE_BANK_ACCOUNT),
        );
        expect(mockPrepareNewBankAccountSetup).not.toHaveBeenCalled();
        expect(mockNavigateToBankAccountRoute).not.toHaveBeenCalled();
    });

    it('starts a fresh setup when there are no other eligible business bank accounts', async () => {
        // The only account is the current one, so it is excluded and nothing else is eligible.
        await setBankAccountList(CURRENT_ONLY_BANK_ACCOUNT_LIST);

        const {result} = renderHook(() => useChangeBankAccount(POLICY_ID, CURRENCY, CURRENT_BANK_ACCOUNT_ID));
        await waitForBatchedUpdates();

        act(() => result.current());

        expect(mockNavigateToBankAccountRoute).toHaveBeenCalledWith({policyID: POLICY_ID, isChangingBankAccount: true});
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does nothing when policyID or currency is missing', async () => {
        await setBankAccountList(OTHER_ELIGIBLE_BANK_ACCOUNT_LIST);

        const {result} = renderHook(() => useChangeBankAccount(undefined, undefined, CURRENT_BANK_ACCOUNT_ID));
        await waitForBatchedUpdates();

        act(() => result.current());

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockPrepareNewBankAccountSetup).not.toHaveBeenCalled();
        expect(mockNavigateToBankAccountRoute).not.toHaveBeenCalled();
    });

    describe('with an EUR Corpay account and a NOK workspace', () => {
        const EUR_CORPAY_BANK_ACCOUNT_LIST = {
            '111': {
                methodID: 111,
                bankCurrency: CONST.CURRENCY.EUR,
                bankCountry: 'DE',
                accountData: {
                    state: CONST.BANK_ACCOUNT.STATE.OPEN,
                    type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                    additionalData: {globalReimbursementProvider: CONST.GLOBAL_REIMBURSEMENT_PROVIDER.CORPAY},
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        } as unknown as BankAccountList;

        it('opens the existing-account picker when the beta is on', async () => {
            // Given the beta is on and the only other account is an EUR Corpay account
            mockIsBetaEnabled([CONST.BETAS.MISMATCHED_REIMBURSEMENT_CURRENCY]);
            await setBankAccountList(EUR_CORPAY_BANK_ACCOUNT_LIST);
            const {result} = renderHook(() => useChangeBankAccount(POLICY_ID, 'NOK', CURRENT_BANK_ACCOUNT_ID));
            await waitForBatchedUpdates();

            // When the admin changes the bank account
            act(() => result.current());

            // Then the picker opens, because the EUR account can pay a NOK workspace
            expect(mockNavigate).toHaveBeenCalledWith(
                ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(POLICY_ID, undefined, CONST.BANK_ACCOUNT.CONNECT_EXISTING_SOURCE.CHANGE_BANK_ACCOUNT),
            );
            expect(mockNavigateToBankAccountRoute).not.toHaveBeenCalled();
        });

        it('starts a fresh setup when the beta is off', async () => {
            // Given the beta is off and the only other account is an EUR Corpay account
            await setBankAccountList(EUR_CORPAY_BANK_ACCOUNT_LIST);
            const {result} = renderHook(() => useChangeBankAccount(POLICY_ID, 'NOK', CURRENT_BANK_ACCOUNT_ID));
            await waitForBatchedUpdates();

            // When the admin changes the bank account
            act(() => result.current());

            // Then a fresh setup starts, because the currency check rejects the EUR account
            expect(mockNavigateToBankAccountRoute).toHaveBeenCalledWith({policyID: POLICY_ID, isChangingBankAccount: true});
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
