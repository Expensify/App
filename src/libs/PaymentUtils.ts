import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Merge, ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import getBankIcon from '@components/Icon/BankIcons';
import type {PaymentMethod as KYCPaymentMethod} from '@components/KYCWall/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type BankAccount from '@src/types/onyx/BankAccount';
import type Fund from '@src/types/onyx/Fund';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import type {ACHAccount} from '@src/types/onyx/Policy';
import {setPersonalBankAccountContinueKYCOnSuccess} from './actions/BankAccounts';
import {approveMoneyRequest} from './actions/IOU';
import {translateLocal} from './Localize';
import BankAccountModel from './models/BankAccount';
import Navigation from './Navigation/Navigation';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;
type TriggerKYCFlow = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType) => void;
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

function getPaymentMethodDescription(accountType: AccountType, account: BankAccount['accountData'] | Fund['accountData'] | ACHAccount, bankCurrency?: string): string {
    if (account) {
        if (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && 'accountNumber' in account) {
            return `${bankCurrency ? `${bankCurrency} ${CONST.DOT_SEPARATOR} ` : ''}${translateLocal('paymentMethodList.accountLastFour')} ${account.accountNumber?.slice(-4)}`;
        }
        if (accountType === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT && 'accountNumber' in account) {
            return `${translateLocal('paymentMethodList.accountLastFour')} ${account.accountNumber?.slice(-4)}`;
        }
        if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD && 'cardNumber' in account) {
            return `${translateLocal('paymentMethodList.cardLastFour')} ${account.cardNumber?.slice(-4)}`;
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
            description: getPaymentMethodDescription(bankAccount?.accountType, bankAccount.accountData, bankAccount.bankCurrency),
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

/**
 * Determines the appropriate payment action based on user validation and policy restrictions.
 * It navigates users to verification pages if necessary, triggers KYC flows for specific payment methods,
 * handles direct approvals, or proceeds with basic payment processing.
 */
const selectPaymentType = (
    event: KYCFlowEvent,
    iouPaymentType: PaymentMethodType,
    triggerKYCFlow: TriggerKYCFlow,
    policy: OnyxEntry<Policy>,
    onPress: (paymentType?: PaymentMethodType, payAsBusiness?: boolean, methodID?: number, paymentMethod?: KYCPaymentMethod) => void,
    isUserValidated?: boolean,
    confirmApproval?: () => void,
    iouReport?: OnyxEntry<Report>,
) => {
    if (policy && shouldRestrictUserBillableActions(policy.id)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
        return;
    }

    if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || iouPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute()));
            return;
        }
        triggerKYCFlow(event, iouPaymentType);
        setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
        return;
    }

    if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
        if (confirmApproval) {
            confirmApproval();
        } else {
            approveMoneyRequest(iouReport);
        }
        return;
    }

    onPress(iouPaymentType);
};

type ApproveActionType = Extract<ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>, 'approve'>;
type PaymentOption = PopoverMenuItem & DropdownOption<ValueOf<typeof CONST.IOU.PAYMENT_TYPE>>;
type PaymentOrApproveOption = Merge<PaymentOption, {value?: PaymentOption['value'] | ApproveActionType}>;
type SecondaryActionOption = DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>>;

const isSecondaryActionAPaymentOption = (item: PopoverMenuItem): item is PaymentOption => {
    if (!('value' in item)) {
        return false;
    }
    const payment = item.value as SecondaryActionOption['value'] | PaymentOrApproveOption['value'];
    const isPaymentInArray = Object.values(CONST.IOU.PAYMENT_TYPE).filter((type) => type === payment);
    return isPaymentInArray.length > 0;
};

export {hasExpensifyPaymentMethod, getPaymentMethodDescription, formatPaymentMethods, calculateWalletTransferBalanceFee, selectPaymentType, isSecondaryActionAPaymentOption};
export type {KYCFlowEvent, TriggerKYCFlow, PaymentOrApproveOption, PaymentOption};
