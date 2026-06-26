import useOnyx from '@hooks/useOnyx';

import {hasExpensifyPaymentMethod} from '@libs/PaymentUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount} from '@src/types/onyx';

type UseIsBankAccountAddedResult = {
    /**
     * Whether the user already has a payment method usable with the wallet, meaning the Add Bank Account step of the
     * Enable Payments flow is complete.
     */
    isBankAccountAdded: boolean;

    /** The personal bank account that was added, if any. */
    addedBankAccount: BankAccount | undefined;
};

function useIsBankAccountAdded(): UseIsBankAccountAddedResult {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const hasActivatedWallet = userWallet?.tierName === CONST.WALLET.TIER_NAME.GOLD || userWallet?.tierName === CONST.WALLET.TIER_NAME.PLATINUM;

    const isBankAccountAdded = hasExpensifyPaymentMethod(fundList ?? {}, bankAccountList ?? {}, hasActivatedWallet);

    const addedBankAccount = isBankAccountAdded
        ? Object.values(bankAccountList ?? {}).find(
              (account) => account?.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && account?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
          )
        : undefined;

    return {isBankAccountAdded, addedBankAccount};
}

export default useIsBankAccountAdded;
