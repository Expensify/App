import useOnyx from '@hooks/useOnyx';
import {hasExpensifyPaymentMethod} from '@libs/PaymentUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Whether the user already has a payment method usable with the wallet, meaning the Add Bank Account step of the
 * Enable Payments flow is complete. userWallet.currentStep alone can't be trusted for this check: it can point past
 * the bank account step (stale or server-driven state) while no payment method actually exists, and it gets rewound
 * when the user navigates back through the flow.
 */
function useIsBankAccountAdded(): boolean {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const hasActivatedWallet = userWallet?.tierName === CONST.WALLET.TIER_NAME.GOLD || userWallet?.tierName === CONST.WALLET.TIER_NAME.PLATINUM;

    return hasExpensifyPaymentMethod(fundList ?? {}, bankAccountList ?? {}, hasActivatedWallet);
}

export default useIsBankAccountAdded;
