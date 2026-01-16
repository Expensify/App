import isEmpty from 'lodash/isEmpty';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Merge, ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import getBankIcon from '@components/Icon/BankIcons';
import type {ContinueActionParams, PaymentMethod as KYCPaymentMethod} from '@components/KYCWall/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {BankAccountMenuItem} from '@components/Search/types';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportNextStepDeprecated} from '@src/types/onyx';
import type BankAccount from '@src/types/onyx/BankAccount';
import type Fund from '@src/types/onyx/Fund';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import type {ACHAccount} from '@src/types/onyx/Policy';
import {setPersonalBankAccountContinueKYCOnSuccess} from './actions/BankAccounts';
import {approveMoneyRequest} from './actions/IOU';
import BankAccountModel from './models/BankAccount';
import Navigation from './Navigation/Navigation';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;
type TriggerKYCFlow = (params: ContinueActionParams) => void;
type AccountType = ValueOf<typeof CONST.PAYMENT_METHODS> | undefined;

type SelectPaymentTypeParams = {
    event: KYCFlowEvent;
    iouPaymentType: PaymentMethodType;
    triggerKYCFlow: TriggerKYCFlow;
    policy: OnyxEntry<Policy>;
    onPress: (paymentType?: PaymentMethodType, payAsBusiness?: boolean, methodID?: number, paymentMethod?: KYCPaymentMethod) => void;
    currentAccountID: number;
    currentEmail: string;
    hasViolations: boolean;
    isASAPSubmitBetaEnabled: boolean;
    isUserValidated?: boolean;
    confirmApproval?: () => void;
    iouReport?: OnyxEntry<Report>;
    iouReportNextStep: OnyxEntry<ReportNextStepDeprecated>;
};

/**
 * Check to see if user has either a debit card or personal US bank account added that can be used with a wallet.
 */
function hasExpensifyPaymentMethod(fundList: Record<string, Fund>, bankAccountList: Record<string, BankAccount>, shouldIncludeDebitCard = true): boolean {
    const validBankAccount = Object.values(bankAccountList).some((bankAccountJSON) => {
        const bankAccount = new BankAccountModel(bankAccountJSON);

        return (
            bankAccount.getPendingAction() !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            bankAccount.isOpen() &&
            bankAccount.getType() === CONST.BANK_ACCOUNT.TYPE.PERSONAL &&
            bankAccount?.getCountry() === CONST.COUNTRY.US
        );
    });

    // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
    const validDebitCard = Object.values(fundList).some((card) => card?.accountData?.additionalData?.isP2PDebitCard ?? false);

    return validBankAccount || (shouldIncludeDebitCard && validDebitCard);
}

function getPaymentMethodDescription(
    accountType: AccountType,
    account: BankAccount['accountData'] | Fund['accountData'] | ACHAccount,
    translate: LocalizedTranslate,
    bankCurrency?: string,
): string {
    if (account) {
        if (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && 'accountNumber' in account) {
            return `${bankCurrency ? `${bankCurrency} ${CONST.DOT_SEPARATOR} ` : ''}${translate('paymentMethodList.accountLastFour')} ${account.accountNumber?.slice(-4)}`;
        }
        if (accountType === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT && 'accountNumber' in account) {
            return `${translate('paymentMethodList.accountLastFour')} ${account.accountNumber?.slice(-4)}`;
        }
        if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD && 'cardNumber' in account) {
            return `${translate('paymentMethodList.cardLastFour')} ${account.cardNumber?.slice(-4)}`;
        }
    }
    return '';
}

/**
 * Get the PaymentMethods list
 */
function formatPaymentMethods(bankAccountList: Record<string, BankAccount>, fundList: Record<string, Fund> | Fund[], styles: ThemeStyles, translate: LocalizedTranslate): PaymentMethod[] {
    const combinedPaymentMethods: PaymentMethod[] = [];

    for (const bankAccount of Object.values(bankAccountList)) {
        // Add all bank accounts besides the wallet
        if (bankAccount?.accountData?.type === CONST.BANK_ACCOUNT_TYPES.WALLET) {
            continue;
        }

        const {icon, iconSize, iconHeight, iconWidth, iconStyles} = getBankIcon({
            bankName: bankAccount?.accountData?.additionalData?.bankName,
            isCard: false,
            styles,
        });
        combinedPaymentMethods.push({
            ...bankAccount,
            description: getPaymentMethodDescription(bankAccount?.accountType, bankAccount.accountData, translate, bankAccount.bankCurrency),
            icon,
            iconSize,
            iconHeight,
            iconWidth,
            iconStyles,
        });
    }

    for (const card of Object.values(fundList)) {
        const {icon, iconSize, iconHeight, iconWidth, iconStyles} = getBankIcon({bankName: card?.accountData?.bank, isCard: true, styles});
        combinedPaymentMethods.push({
            ...card,
            description: getPaymentMethodDescription(card?.accountType, card.accountData, translate),
            icon,
            iconSize,
            iconHeight,
            iconWidth,
            iconStyles,
        });
    }

    return combinedPaymentMethods;
}

function calculateWalletTransferBalanceFee(currentBalance: number, methodType: string): number {
    const transferMethodTypeFeeStructure =
        methodType === CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT ? CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT : CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.ACH;
    const calculateFee = Math.ceil(currentBalance * (transferMethodTypeFeeStructure.RATE / 100));
    return Math.max(calculateFee, transferMethodTypeFeeStructure.MINIMUM_FEE);
}

/**
 * Navigates the user to the appropriate account verification page based on the current route context.
 */
const handleUnvalidatedAccount = (iouReport: OnyxEntry<Report>) => {
    const activeRoute = Navigation.getActiveRoute();
    const reportID = iouReport?.reportID;
    if (!reportID) {
        // Technically possible but should never happen in real life
        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute()));
        return;
    }

    if (activeRoute.includes(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}))) {
        Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(reportID));
    } else if (activeRoute.includes(ROUTES.SEARCH_REPORT.getRoute({reportID}))) {
        Navigation.navigate(ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(reportID));
    } else {
        Navigation.navigate(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(reportID));
    }
};

/**
 * Determines the appropriate payment action based on user validation and policy restrictions.
 * It navigates users to verification pages if necessary, triggers KYC flows for specific payment methods,
 * handles direct approvals, or proceeds with basic payment processing.
 */
const selectPaymentType = (params: SelectPaymentTypeParams) => {
    const {
        event,
        iouPaymentType,
        triggerKYCFlow,
        policy,
        onPress,
        currentAccountID,
        currentEmail,
        hasViolations,
        isASAPSubmitBetaEnabled,
        isUserValidated,
        confirmApproval,
        iouReport,
        iouReportNextStep,
    } = params;
    if (policy && shouldRestrictUserBillableActions(policy.id)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
        return;
    }

    if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || iouPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
        if (!isUserValidated) {
            return handleUnvalidatedAccount(iouReport);
        }
        triggerKYCFlow({event, iouPaymentType});
        setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
        return;
    }

    if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
        if (confirmApproval) {
            confirmApproval();
        } else {
            approveMoneyRequest(iouReport, policy, currentAccountID, currentEmail, hasViolations, isASAPSubmitBetaEnabled, iouReportNextStep, true);
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

/**
 * Get the appropriate payment type, selected policy, and whether a payment method should be selected
 * based on the provided payment method, active admin policies, and latest bank items.
 */
function getActivePaymentType(paymentMethod: string | undefined, activeAdminPolicies: Policy[], latestBankItems: BankAccountMenuItem[] | undefined, policyID?: string | undefined) {
    const isPaymentMethod = Object.values(CONST.PAYMENT_METHODS).includes(paymentMethod as ValueOf<typeof CONST.PAYMENT_METHODS>);
    const shouldSelectPaymentMethod = isPaymentMethod || !isEmpty(latestBankItems);
    // payment method is equal to policyID when user selects "Pay via workspace" option
    const selectedPolicy = activeAdminPolicies.find((activePolicy) => activePolicy.id === policyID || activePolicy.id === paymentMethod);

    let paymentType;
    switch (paymentMethod) {
        case CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT:
            paymentType = CONST.IOU.PAYMENT_TYPE.EXPENSIFY;
            break;
        case CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT:
            paymentType = CONST.IOU.PAYMENT_TYPE.VBBA;
            break;
        default:
            paymentType = CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
            break;
    }

    return {
        paymentType,
        selectedPolicy,
        shouldSelectPaymentMethod,
    };
}

export {
    hasExpensifyPaymentMethod,
    getPaymentMethodDescription,
    formatPaymentMethods,
    calculateWalletTransferBalanceFee,
    handleUnvalidatedAccount,
    selectPaymentType,
    isSecondaryActionAPaymentOption,
    getActivePaymentType,
};
export type {KYCFlowEvent, TriggerKYCFlow, PaymentOrApproveOption, PaymentOption, SelectPaymentTypeParams};
