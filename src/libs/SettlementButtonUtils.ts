import {useMemo} from 'react';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {BankAccount, Policy} from '@src/types/onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import Log from './Log';
import Navigation from './Navigation/Navigation';

type GetSecondaryTextParams = {
    shouldUseShortForm: boolean;
    lastPaymentMethod: string | undefined;
    paymentButtonOptions: Array<DropdownOption<string>>;
    shouldHidePaymentOptions: boolean;
    shouldShowApproveButton: boolean;
    onlyShowPayElsewhere: boolean | undefined;
    lastPaymentPolicy: OnyxEntry<Policy>;
    hasIntentToPay: boolean;
    isExpenseReport: boolean;
    isInvoiceReport: boolean;
    policy: OnyxEntry<Policy>;
    bankAccountToDisplay: BankAccount | PaymentMethod | undefined;
    personalBankAccountList: PaymentMethod[];
    bankAccount: BankAccount | undefined;
    translate: LocaleContextProps['translate'];
};

/**
 * Determines the secondary text to display on the SettlementButton based on the payment context.
 * For expense reports, this will show the bank account info (never Wallet).
 * For IOUs, this may show Wallet if available.
 * For invoices, this shows the appropriate bank account type.
 */
function getSecondaryText({
    shouldUseShortForm,
    lastPaymentMethod,
    paymentButtonOptions,
    shouldHidePaymentOptions,
    shouldShowApproveButton,
    onlyShowPayElsewhere,
    lastPaymentPolicy,
    hasIntentToPay,
    isExpenseReport,
    isInvoiceReport,
    policy,
    bankAccountToDisplay,
    personalBankAccountList,
    bankAccount,
    translate,
}: GetSecondaryTextParams): string | undefined {
    if (
        shouldUseShortForm ||
        lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE ||
        (paymentButtonOptions.length === 1 && paymentButtonOptions.every((option) => option.value === CONST.IOU.PAYMENT_TYPE.ELSEWHERE)) ||
        (shouldHidePaymentOptions && (shouldShowApproveButton || onlyShowPayElsewhere))
    ) {
        return undefined;
    }

    if (lastPaymentPolicy) {
        return lastPaymentPolicy.name;
    }

    // Handle bank account payments first (expense reports require bank account, never wallet)
    if ((lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.VBBA || (hasIntentToPay && isExpenseReport)) && !!policy?.achAccount) {
        if (policy?.achAccount?.accountNumber) {
            return translate('paymentMethodList.bankAccountLastFour', policy?.achAccount?.accountNumber?.slice(-4));
        }

        if (!bankAccountToDisplay?.accountData?.accountNumber) {
            return undefined;
        }

        return translate('paymentMethodList.bankAccountLastFour', bankAccountToDisplay?.accountData?.accountNumber?.slice(-4));
    }

    // Handle wallet payments for IOUs and bank account display for invoices
    if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || (hasIntentToPay && isInvoiceReport)) {
        if (isInvoiceReport) {
            const isBusinessBankAccount = bankAccountToDisplay?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS;
            return translate(isBusinessBankAccount ? 'iou.invoiceBusinessBank' : 'iou.invoicePersonalBank', bankAccountToDisplay?.accountData?.accountNumber?.slice(-4) ?? '');
        }

        if (!personalBankAccountList.length) {
            return undefined;
        }

        return translate('common.wallet');
    }

    if (bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && isExpenseReport) {
        return translate('paymentMethodList.bankAccountLastFour', bankAccount?.accountData?.accountNumber?.slice(-4) ?? '');
    }

    return undefined;
}

type RouteMapping = {
    /** Condition that determines if this route mapping applies to the current active route */
    check: (activeRoute: string) => boolean;

    /** Navigates to the appropriate verification route when the check condition is met */
    navigate: () => void;
};

/**
 * Retrieves an array of available RouteMappings for an unvalidated user.
 * Each mapping contains a `check` function that determines whether the activeRoute matches the given mapping and a `navigate` function that executes navigation to the corresponding route.
 * @param chatReportID - The chat or workspace ID from which the unvalidated user makes a payment via SettlementButton
 * @param reportID - The expense report ID that the user pays using SettlementButton (optional)
 * @return An array of available RouteMappings suitable for an unvalidated user
 */
const getRouteMappings = (chatReportID: string, reportID?: string): RouteMapping[] => {
    const nonReportIdRouteMappings = [
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.SEARCH_ROOT.getRoute({query: ''})),
            navigate: () => Navigation.navigate(ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT),
        },
        {
            check: (activeRoute: string) =>
                activeRoute.includes(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, chatReportID)),
            navigate: () =>
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, chatReportID),
                ),
        },
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.REPORT_WITH_ID.getRoute(chatReportID)),
            navigate: () => Navigation.navigate(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(chatReportID)),
        },
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.SEARCH_REPORT.getRoute({reportID: chatReportID})),
            navigate: () => Navigation.navigate(ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(chatReportID)),
        },
    ];

    if (reportID === undefined) {
        return nonReportIdRouteMappings;
    }

    const reportIdRouteMappings = [
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID})),
            navigate: () => Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(reportID)),
        },
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.SEARCH_REPORT.getRoute({reportID})),
            navigate: () => Navigation.navigate(ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(reportID)),
        },
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.REPORT_WITH_ID.getRoute(reportID)),
            navigate: () => Navigation.navigate(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(reportID)),
        },
    ];

    return [...nonReportIdRouteMappings, ...reportIdRouteMappings];
};

/**
 * Handles SettlementButton navigation for unvalidated users based on the active route and current chatID, reportID (optional).
 */
const handleUnvalidatedUserNavigation = (chatReportID: string, reportID?: string) => {
    const activeRoute = Navigation.getActiveRoute();
    const matchedRoute = getRouteMappings(chatReportID, reportID).find((mapping) => mapping.check(activeRoute));

    if (matchedRoute) {
        matchedRoute.navigate();
        return;
    }
    Log.warn('Failed to navigate to the correct path');
};

/**
 * Retrieves SettlementButton payment methods.
 */
const useSettlementButtonPaymentMethods = (hasActivatedWallet: boolean, translate: LocaleContextProps['translate']) => {
    const icons = useMemoizedLazyExpensifyIcons(['User', 'Building', 'CheckCircle'] as const);

    const paymentMethods = useMemo(() => {
        return {
            [CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]: {
                text: hasActivatedWallet ? translate('iou.settleWallet', {formattedAmount: ''}) : translate('iou.settlePersonal', {formattedAmount: ''}),
                icon: icons.User,
                value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                key: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            },
            [CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]: {
                text: translate('iou.settleBusiness', {formattedAmount: ''}),
                icon: icons.Building,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere', {formattedAmount: ''}),
                icon: icons.CheckCircle,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                shouldUpdateSelectedIndex: false,
                key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };
    }, [hasActivatedWallet, translate, icons]);

    return paymentMethods;
};

export {handleUnvalidatedUserNavigation, useSettlementButtonPaymentMethods, getSecondaryText};
export type {GetSecondaryTextParams};
