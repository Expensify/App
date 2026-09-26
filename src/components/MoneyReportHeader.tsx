import useCarouselTransactionIDs from '@hooks/useCarouselTransactionIDs';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useMoneyReportHeaderMoreContentVisibility from '@hooks/useMoneyReportHeaderMoreContentVisibility';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportPrimaryAction from '@hooks/useReportPrimaryAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

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

    // The same filtered list MoneyRequestReportTransactionsNavigation renders from, so the two agree on whether
    // there is an expense carousel to show. Gating on the raw Onyx list let this pick the expense branch while the
    // carousel found nothing to page through, leaving the user with neither set of arrows.
    const {transactionIDs: activeTransactionIDs} = useCarouselTransactionIDs();

    const singleTransactionID = transactions.length === 1 ? transactions.at(0)?.transactionID : undefined;

    const threadParentReportActionID = moneyRequestReport?.parentReportActionID;
    const threadTransactionIDSelector = useCallback(
        (parentReportActions: OnyxEntry<OnyxTypes.ReportActions>) => {
            const parentReportAction = threadParentReportActionID ? parentReportActions?.[threadParentReportActionID] : undefined;
            return isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;
        },
        [threadParentReportActionID],
    );
    const [threadTransactionID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(moneyRequestReport?.parentReportID)}`, {selector: threadTransactionIDSelector});

    const anchorTransactionIDFromRoute = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ? route.params.anchorTransactionID : undefined;
    const routeAnchorTransactionID = anchorTransactionIDFromRoute && activeTransactionIDs.includes(anchorTransactionIDFromRoute) ? anchorTransactionIDFromRoute : undefined;
    // The route anchor is the most reliable source right after a cold open: the report's own transactions and its
    // parent report action may not have loaded yet, and without it the carousel would pop in only once they do.
    //
    // A report reached from the Reports list (or paged onto by that list's own arrows) is never anchored to an
    // expense: every entry point that opens an expense with a carousel uses SEARCH_REPORT instead. Anchoring it
    // let a one-expense report hand its arrows to whatever expense list happened to be active - the Expenses tab's
    // list, one tab over - and page the user out of the reports they were browsing.
    const carouselAnchorTransactionID = route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT ? undefined : (singleTransactionID ?? threadTransactionID ?? routeAnchorTransactionID);
    // Two entries are the minimum for a carousel; with fewer, fall through to the report-level arrows rather than
    // rendering an expense carousel that decides on its own to show nothing.
    //
    // The carousel also only belongs in an RHP, which is where every entry point that seeds one opens the expense.
    // Without the screen check the Inbox central pane would pick up whatever list is active - a single global value
    // that outlives the screen that wrote it - and show arrows for expenses the user last saw somewhere else.
    const shouldShowTransactionNavigation =
        route.name !== SCREENS.REPORT && !!carouselAnchorTransactionID && activeTransactionIDs.length > 1 && activeTransactionIDs.includes(carouselAnchorTransactionID);

    const styles = useThemeStyles();

    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout, shouldUseNarrowLayout: shouldUseNarrowLayoutOnWideRHP} = useResponsiveLayoutOnWideRHP();

    const shouldShowHeaderButtonsInHeaderRow = isInLandscapeMode || !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const isReportInRHP = route.name !== SCREENS.REPORT;
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;

    // The report-level arrows page through search results, so they are search-only; the expense carousel takes
    // precedence wherever this report is anchored to one.
    const shouldShowReportNavigation = !shouldShowTransactionNavigation && isReportInSearch;

    const {statusBarType, shouldShowNextStep, hasStatusOrNextStep} = useMoneyReportHeaderMoreContentVisibility(reportIDProp);
    const shouldRenderActionsInHeaderRow = shouldShowHeaderButtonsInHeaderRow && !hasStatusOrNextStep;
    // A narrow header has room for one control beside the title, and prev/next wins it: the arrows are the only way
    // to reach this expense's siblings, whereas the search router is still one back-press away on the screen the
    // user came from. Where no arrows are rendered the magnifier keeps its place, as it did before.
    const shouldDisplaySearchRouter = !isReportInRHP || (isSmallScreenWidth && !shouldShowTransactionNavigation && !shouldShowReportNavigation);

    const backTo = (route.params as {backTo?: Route} | undefined)?.backTo;

    const primaryAction = useReportPrimaryAction(reportIDProp);

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const isFocused = useIsFocused();

    useEffect(() => {
        return () => {
            turnOffMobileSelectionMode();
        };
    }, []);

    if (isMobileSelectionModeEnabled && shouldUseNarrowLayout && isFocused) {
        // If mobile selection mode is enabled but only one or no transactions remain, turn it off. The selection mode
        // is shared with every screen, so this report only gets to turn it off while it is the focused one. Another
        // screen on top of it, such as the add existing expense modal, owns the mode for as long as it is open.
        const visibleTransactions = transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);
        if (visibleTransactions.length <= 1) {
            turnOffMobileSelectionMode();
        }

        // In a wide/super-wide RHP on a wide screen the header stays in its wide state and shows the "X selected"
        // dropdown instead, matching the transaction list and the selection toolbar which are both wide-RHP aware.
        if (shouldUseNarrowLayoutOnWideRHP) {
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
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    {shouldRenderActionsInHeaderRow && (
                        <MoneyReportHeaderActions
                            reportID={reportIDProp}
                            primaryAction={primaryAction}
                            isReportInSearch={isReportInSearch}
                            backTo={backTo}
                        />
                    )}
                    {shouldShowTransactionNavigation && !!carouselAnchorTransactionID ? (
                        <MoneyRequestReportTransactionsNavigation
                            currentTransactionID={carouselAnchorTransactionID}
                            shouldDisplayNarrowVersion={!shouldShowHeaderButtonsInHeaderRow}
                        />
                    ) : (
                        shouldShowReportNavigation && (
                            <MoneyRequestReportNavigation
                                reportID={reportIDProp}
                                shouldDisplayNarrowVersion={!shouldShowHeaderButtonsInHeaderRow}
                            />
                        )
                    )}
                </View>
            </HeaderWithBackButton>
            {!shouldShowHeaderButtonsInHeaderRow && (
                <MoneyReportHeaderActions
                    reportID={reportIDProp}
                    primaryAction={primaryAction}
                    isReportInSearch={isReportInSearch}
                    backTo={backTo}
                />
            )}
            <MoneyReportHeaderMoreContent
                reportID={reportIDProp}
                primaryAction={primaryAction}
                backTo={backTo}
                statusBarType={statusBarType}
                shouldShowNextStep={shouldShowNextStep}
                shouldRenderActionsInRow={shouldShowHeaderButtonsInHeaderRow && !shouldRenderActionsInHeaderRow}
            />
            <HeaderLoadingBar />
        </View>
    );
}

export default MoneyReportHeader;
