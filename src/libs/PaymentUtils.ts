import {SvgProps} from 'react-native-svg';
import {FC} from 'react';
// eslint-disable-next-line import/no-named-default
import {default as BankAccountModel} from './models/BankAccount';
import getBankIcon from '../components/Icon/BankIcons';
import CONST from '../CONST';
import * as Localize from './Localize';
import Fund from '../types/onyx/Fund';
import BankAccount from '../types/onyx/BankAccount';

type AccountType = 'debitCard' | 'bankAccount';

type PaymentMethod = {
    description: string;
    icon: FC<SvgProps>;
    iconSize: number;
} & BankAccount &
    Fund;

/**
 * Check to see if user has either a debit card or personal bank account added
 */
function hasExpensifyPaymentMethod(fundList: Record<string, Fund>, bankAccountList: Record<string, BankAccount>): boolean {
    const validBankAccount = Object.values(bankAccountList).some((bankAccountJSON) => {
        const bankAccount = new BankAccountModel(bankAccountJSON);
        return bankAccount.isDefaultCredit();
    });

    // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
    const validDebitCard = Object.values(fundList).some((card) => card?.accountData?.additionalData?.isP2PDebitCard ?? false);

    return validBankAccount || validDebitCard;
}

function getPaymentMethodDescription(accountType: AccountType, account: BankAccount['accountData'] & Fund['accountData']): string {
    if (account) {
        if (accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT && account?.accountNumber) {
            return `${Localize.translateLocal('paymentMethodList.accountLastFour')} ${account?.accountNumber?.slice(-4)}`;
        }
        if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            return `${Localize.translateLocal('paymentMethodList.cardLastFour')} ${account?.cardNumber?.slice(-4)}`;
        }
    }
    return '';
}

/**
 * Get the PaymentMethods list
 */
function formatPaymentMethods(bankAccountList: Record<string, BankAccount>, fundList: Record<string, Fund>) {
    const combinedPaymentMethods: PaymentMethod[] = [];

    Object.values(bankAccountList).forEach((bankAccount) => {
        // Add all bank accounts besides the wallet
        if (bankAccount?.accountData?.type === CONST.BANK_ACCOUNT_TYPES.WALLET) {
            return;
        }

        const {icon, iconSize} = getBankIcon(bankAccount?.accountData?.additionalData?.bankName ?? '', false);
        combinedPaymentMethods.push({
            ...bankAccount,
            description: getPaymentMethodDescription(bankAccount?.accountType as AccountType, bankAccount.accountData),
            icon,
            iconSize,
        });
    });

    Object.values(fundList).forEach((card) => {
        const {icon, iconSize} = getBankIcon(card?.accountData?.bank ?? '', true);
        combinedPaymentMethods.push({
            ...card,
            description: getPaymentMethodDescription(card?.accountType as AccountType, card.accountData),
            icon,
            iconSize,
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
