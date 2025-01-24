import type {ValueOf} from 'type-fest';
import getBankIcon from '@components/Icon/BankIcons';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import type BankAccount from '@src/types/onyx/BankAccount';
import type Fund from '@src/types/onyx/Fund';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import type {ACHAccount} from '@src/types/onyx/Policy';
import * as Localize from './Localize';
import BankAccountModel from './models/BankAccount';

type AccountType = ValueOf<typeof CONST.PAYMENT_METHODS> | undefined;

/**
 * Check to see if user has either a debit card or personal bank account added that can be used with a wallet.
 */
function hasExpensifyPaymentMethod(fundList: Record<string, Fund>, bankAccountList: Record<string, BankAccount>, shouldIncludeDebitCard = true): boolean {
    const validBankAccount = Object.values(bankAccountList).some((bankAccountJSON) => {
        const bankAccount = new BankAccountModel(bankAccountJSON);

        return bankAccount.getPendingAction() !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && bankAccount.isOpen() && bankAccount.getType() === CONST.BANK_ACCOUNT.TYPE.PERSONAL;
    });

    // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
    const validDebitCard = Object.values(fundList).some((card) => card?.accountData?.additionalData?.isP2PDebitCard ?? false);

    return validBankAccount || (shouldIncludeDebitCard && validDebitCard);
}

function getPaymentMethodDescription(accountType: AccountType, account: BankAccount['accountData'] | Fund['accountData'] | ACHAccount): string {
    if (account) {
        if (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && 'accountNumber' in account) {
            return `${Localize.translateLocal('paymentMethodList.accountLastFour')} ${account.accountNumber?.slice(-4)}`;
        }
        if (accountType === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT && 'accountNumber' in account) {
            return `${Localize.translateLocal('paymentMethodList.accountLastFour')} ${account.accountNumber?.slice(-4)}`;
        }
        if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD && 'cardNumber' in account) {
            return `${Localize.translateLocal('paymentMethodList.cardLastFour')} ${account.cardNumber?.slice(-4)}`;
        }
    }
    return '';
}

/**
 * Get the PaymentMethods list
 */
function formatPaymentMethods(bankAccountList: Record<string, BankAccount>, fundList: Record<string, Fund> | Fund[], styles: ThemeStyles): PaymentMethod[] {
    const combinedPaymentMethods: PaymentMethod[] = [];

    Object.values(bankAccountList).forEach((bankAccount) => {
        // Add all bank accounts besides the wallet
        if (bankAccount?.accountData?.type === CONST.BANK_ACCOUNT_TYPES.WALLET) {
            return;
        }

        const {icon, iconSize, iconHeight, iconWidth, iconStyles} = getBankIcon({
            bankName: bankAccount?.accountData?.additionalData?.bankName,
            isCard: false,
            styles,
        });
        combinedPaymentMethods.push({
            ...bankAccount,
            description: getPaymentMethodDescription(bankAccount?.accountType, bankAccount.accountData),
            icon,
            iconSize,
            iconHeight,
            iconWidth,
            iconStyles,
        });
    });

    Object.values(fundList).forEach((card) => {
        const {icon, iconSize, iconHeight, iconWidth, iconStyles} = getBankIcon({bankName: card?.accountData?.bank, isCard: true, styles});
        combinedPaymentMethods.push({
            ...card,
            description: getPaymentMethodDescription(card?.accountType, card.accountData),
            icon,
            iconSize,
            iconHeight,
            iconWidth,
            iconStyles,
        });
    });

    return combinedPaymentMethods;
}

function calculateWalletTransferBalanceFee(currentBalance: number, methodType: string): number {
    const transferMethodTypeFeeStructure =
        methodType === CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT ? CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT : CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.ACH;
    const calculateFee = Math.ceil(currentBalance * (transferMethodTypeFeeStructure.RATE / 100));
    return Math.max(calculateFee, transferMethodTypeFeeStructure.MINIMUM_FEE);
}

export {hasExpensifyPaymentMethod, getPaymentMethodDescription, formatPaymentMethods, calculateWalletTransferBalanceFee};
