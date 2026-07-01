import {useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportPrimaryAction from '@hooks/useReportPrimaryAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import HeaderLoadingBar from './HeaderLoadingBar';
import HeaderWithBackButton from './HeaderWithBackButton';
import MoneyReportHeaderActions from './MoneyReportHeaderActions';
import MoneyReportHeaderModals from './MoneyReportHeaderModals';
import MoneyReportHeaderMoreContent from './MoneyReportHeaderMoreContent';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';
import MoneyRequestReportTransactionsNavigation from './MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';
import {PaymentAnimationsProvider} from './PaymentAnimationsContext';
import {useSearchSelectionActions} from './Search/SearchContext';

type MoneyReportHeaderProps = {
    /** The reportID of the report currently being looked at */
    reportID: string | undefined;

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({reportID, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    return (
        <MoneyReportHeaderModals reportID={reportID}>
            <PaymentAnimationsProvider>
                <MoneyReportHeaderContent
                    reportID={reportID}
                    shouldDisplayBackButton={shouldDisplayBackButton}
                    onBackButtonPress={onBackButtonPress}
                />
            </PaymentAnimationsProvider>
        </MoneyReportHeaderModals>
    );
}

function MoneyReportHeaderContent({reportID: reportIDProp, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDProp}`);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const {isOffline} = useNetwork();

    const {translate} = useLocalize();

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const transactions = Object.values(reportTransactions);

    const [activeTransactionIDs] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);

    // When the user opens a one-transaction parent report from the flat Spend > Expenses list, the report-level
    // carousel (search-based) is inactive (search type is EXPENSE, not EXPENSE_REPORT). Fall back to the
    // transaction carousel, anchored on the parent's single transaction, so navigating ◄/► pages through the
    // expenses the user was browsing. The carousel itself handles routing to either the parent report (for
    // other one-tx parents) or the transaction thread (for multi-tx parents).
    const singleTransactionID = transactions.length === 1 ? transactions.at(0)?.transactionID : undefined;

    // For multi-tx parents we don't have a single transaction to anchor on, but if the parent was
    // navigated to from a broader carousel (the no-thread fallback in MoneyRequestReportTransactionsNavigation
    // passes `anchorTransactionID`), use that transaction as the carousel anchor so the user can keep
    // paging the broader list. Falls back to the first of this report's transactions found in the active
    // list, so the carousel still renders even without an explicit hint.
    const anchorTransactionIDFromRoute = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ? route.params.anchorTransactionID : undefined;
    const multiTxAnchorTransactionID = useMemo(() => {
        if (singleTransactionID) {
            return undefined;
        }
        // Trust the route hint as long as it's part of the active carousel list. We don't also require it to be in
        // this report's `transactions` because when arriving from a search-based carousel the parent report's
        // transactions may not be in the live collection yet, which would otherwise hide the carousel entirely.
        if (anchorTransactionIDFromRoute && activeTransactionIDs?.includes(anchorTransactionIDFromRoute)) {
            return anchorTransactionIDFromRoute;
        }
        if (!activeTransactionIDs) {
            return undefined;
        }
        return transactions.find((t) => activeTransactionIDs.includes(t.transactionID))?.transactionID;
    }, [singleTransactionID, anchorTransactionIDFromRoute, transactions, activeTransactionIDs]);
    const carouselAnchorTransactionID = singleTransactionID ?? multiTxAnchorTransactionID;
    const shouldShowTransactionNavigation = !!carouselAnchorTransactionID && !!activeTransactionIDs?.includes(carouselAnchorTransactionID);

    const styles = useThemeStyles();

    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();

    const shouldShowHeaderButtonsInHeaderRow = isInLandscapeMode || !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;
    const isReportInRHP = route.name !== SCREENS.REPORT;
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;
    const shouldDisplaySearchRouter = !isReportInRHP || (isSmallScreenWidth && !isReportInSearch);

    const backTo = (route.params as {backTo?: Route} | undefined)?.backTo;

    const primaryAction = useReportPrimaryAction(reportIDProp);

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    useEffect(() => {
        return () => {
            turnOffMobileSelectionMode();
        };
    }, []);

    if (isMobileSelectionModeEnabled && shouldUseNarrowLayout) {
        // If mobile selection mode is enabled but only one or no transactions remain, turn it off
        const visibleTransactions = transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);
        if (visibleTransactions.length <= 1) {
            turnOffMobileSelectionMode();
        }

        return (
            <HeaderWithBackButton
                title={translate('common.selectMultiple')}
                onBackButtonPress={() => {
                    clearSelectedTransactions(true);
                    turnOffMobileSelectionMode();
                }}
            />
        );
    }

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldDisplayStatus
                shouldShowPinButton={false}
                report={moneyRequestReport}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                shouldDisplayHelpButton={!(isReportInRHP && shouldUseNarrowLayout)}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
                shouldEnableDetailPageNavigation
                openParentReportInCurrentTab
            >
                {isReportInSearch &&
                    (shouldShowTransactionNavigation && carouselAnchorTransactionID ? (
                        <MoneyRequestReportTransactionsNavigation
                            currentTransactionID={carouselAnchorTransactionID}
                            shouldDisplayNarrowVersion={!shouldShowHeaderButtonsInHeaderRow}
                        />
                    ) : (
                        <MoneyRequestReportNavigation
                            reportID={reportIDProp}
                            shouldDisplayNarrowVersion={!shouldShowHeaderButtonsInHeaderRow}
                        />
                    ))}
            </HeaderWithBackButton>
            {!shouldShowHeaderButtonsInHeaderRow && (
                <View style={styles.mtn1}>
                    <MoneyReportHeaderActions
                        reportID={reportIDProp}
                        primaryAction={primaryAction}
                        isReportInSearch={isReportInSearch}
                        backTo={backTo}
                    />
                </View>
            )}
            <MoneyReportHeaderMoreContent
                reportID={reportIDProp}
                primaryAction={primaryAction}
                backTo={backTo}
                shouldShowHeaderButtonsInHeaderRow={shouldShowHeaderButtonsInHeaderRow}
            />
            <HeaderLoadingBar />
        </View>
    );
}

export default MoneyReportHeader;
