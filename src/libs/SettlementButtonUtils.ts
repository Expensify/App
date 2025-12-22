import {useMemo} from 'react';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import Log from './Log';
import Navigation from './Navigation/Navigation';

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
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: chatReportID})),
            navigate: () => Navigation.navigate(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(chatReportID)),
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
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID})),
            navigate: () => Navigation.navigate(ROUTES.EXPENSE_REPORT_VERIFY_ACCOUNT.getRoute(reportID)),
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

export {handleUnvalidatedUserNavigation, useSettlementButtonPaymentMethods};
