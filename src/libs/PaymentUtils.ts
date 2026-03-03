import isEmpty from 'lodash/isEmpty';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {Merge, ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import getBankIcon from '@components/Icon/BankIcons';
import type {ContinueActionParams} from '@components/KYCWall/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {BankAccountMenuItem} from '@components/Search/types';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {AccountData, Beta, BillingGraceEndPeriod, Policy, Report, ReportNextStepDeprecated} from '@src/types/onyx';
import type BankAccount from '@src/types/onyx/BankAccount';
import type Fund from '@src/types/onyx/Fund';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import type {ACHAccount} from '@src/types/onyx/Policy';
import {setPersonalBankAccountContinueKYCOnSuccess} from './actions/BankAccounts';
import {approveMoneyRequest} from './actions/IOU';
import {isBankAccountPartiallySetup} from './BankAccountUtils';
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
    onPress: (params: PaymentActionParams) => void;
    currentAccountID: number;
    currentEmail: string;
    hasViolations: boolean;
    isASAPSubmitBetaEnabled: boolean;
    isUserValidated?: boolean;
    confirmApproval?: () => void;
    iouReport?: OnyxEntry<Report>;
    iouReportNextStep: OnyxEntry<ReportNextStepDeprecated>;
    betas: OnyxEntry<Beta[]>;
    userBillingGraceEndPeriods: OnyxCollection<BillingGraceEndPeriod>;
};

type BusinessBankAccountOption = {
    text: string;
    description: string;
    icon: PaymentMethod['icon'];
    iconStyles: PaymentMethod['iconStyles'];
    iconSize: PaymentMethod['iconSize'];
    methodID: number | undefined;
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

/**
 * Ensures data has the shape of AccountData so we can safely read values from it without type casting.
 */
function isAccountData(data: unknown): data is AccountData {
    return typeof data === 'object' && data !== null && 'type' in data && 'state' in data;
}

/**
 * Returns all valid business bank accounts for the pay menu.
 * Allows admins to pay with any business bank account they have access to, not only the workspace-linked one.
 */
function getBusinessBankAccountOptions(formattedPaymentMethods: PaymentMethod[]): BusinessBankAccountOption[] {
    return formattedPaymentMethods
        .filter((method) => {
            if (!isAccountData(method?.accountData)) {
                return false;
            }
            const accountData = method.accountData;
            const isPartiallySetup = isBankAccountPartiallySetup(accountData.state);
            return accountData.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && accountData.state === CONST.BANK_ACCOUNT.STATE.OPEN && method?.methodID != null && !isPartiallySetup;
        })
        .map((formattedPaymentMethod) => ({
            text: formattedPaymentMethod?.title ?? '',
            description: formattedPaymentMethod?.description ?? '',
            icon: formattedPaymentMethod?.icon,
            iconStyles: formattedPaymentMethod?.iconStyles,
            iconSize: formattedPaymentMethod?.iconSize,
            methodID: formattedPaymentMethod?.methodID,
        }));
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
        betas,
        userBillingGraceEndPeriods,
    } = params;
    if (policy && shouldRestrictUserBillableActions(policy.id, userBillingGraceEndPeriods)) {
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
            approveMoneyRequest(iouReport, policy, currentAccountID, currentEmail, hasViolations, isASAPSubmitBetaEnabled, iouReportNextStep, betas, userBillingGraceEndPeriods, true);
        }
        return;
    }

    onPress({paymentType: iouPaymentType});
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
 * Get the appropriate payment type, policy from context (policy related to payment type), policy from payment method, and whether a payment method should be selected
 * based on the provided payment method, active admin policies, and valid business bank account options.
 */
function getActivePaymentType(
    paymentMethod: string | undefined,
    activeAdminPolicies: Policy[],
    businessBankAccountOptions: BankAccountMenuItem[] | undefined,
    policyID?: string | undefined,
) {
    const isPaymentMethod = Object.values(CONST.PAYMENT_METHODS).includes(paymentMethod as ValueOf<typeof CONST.PAYMENT_METHODS>);

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

    // Policy related to the context ie: Policy related to opened chat
    const policyFromContext = activeAdminPolicies.find((activePolicy) => activePolicy.id === policyID);

    // Policy that is part of payment method ie: Policy when user presses on 'Pay via workspace' option
    const policyFromPaymentMethod = activeAdminPolicies.find((activePolicy) => activePolicy.id === paymentMethod);

    // When user explicitly selects "Pay Elsewhere" / "Mark as Paid", don't require payment method selection since payment happens outside of Expensify
    const shouldSelectPaymentMethod = paymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && (isPaymentMethod || !isEmpty(businessBankAccountOptions));

    return {
        paymentType,
        policyFromContext,
        policyFromPaymentMethod,
        shouldSelectPaymentMethod,
    };
}

/**
 * Get the last 4 digits of a bank account used for payment.
 */
function getBankAccountLastFourDigits(bankAccountID: number | undefined, bankAccountList: OnyxEntry<Record<string, BankAccount>>, policy: OnyxEntry<Policy>): string {
    const bankAccount = bankAccountID ? bankAccountList?.[bankAccountID] : null;

    return bankAccount?.accountData?.accountNumber?.slice(-4) ?? policy?.achAccount?.accountNumber?.slice(-4) ?? '';
}

export {
    hasExpensifyPaymentMethod,
    getPaymentMethodDescription,
    formatPaymentMethods,
    getBusinessBankAccountOptions,
    calculateWalletTransferBalanceFee,
    handleUnvalidatedAccount,
    selectPaymentType,
    isSecondaryActionAPaymentOption,
    getActivePaymentType,
    getBankAccountLastFourDigits,
};
export type {KYCFlowEvent, TriggerKYCFlow, PaymentOrApproveOption, PaymentOption, SelectPaymentTypeParams, BusinessBankAccountOption};
