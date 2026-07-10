import {act, renderHook} from '@testing-library/react-native';

import useChangeBankAccount from '@hooks/useChangeBankAccount';

import Navigation from '@navigation/Navigation';

import {navigateToBankAccountRoute, prepareNewBankAccountSetup} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

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

        expect(mockPrepareNewBankAccountSetup).toHaveBeenCalledWith(CURRENCY);
        expect(mockNavigateToBankAccountRoute).toHaveBeenCalledWith({policyID: POLICY_ID});
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
});
