import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
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
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
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
import {PaymentAnimationsProvider} from './PaymentAnimationsContext';
import {useSearchActionsContext} from './Search/SearchContext';

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
    const {clearSelectedTransactions} = useSearchActionsContext();
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDProp}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
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

    const styles = useThemeStyles();

    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();

    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;
    const isReportInRHP = route.name !== SCREENS.REPORT;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;
    // eslint-disable-next-line no-restricted-syntax -- backTo is a legacy route param, preserving existing behavior
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
                policy={policy}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                shouldDisplayHelpButton={!(isReportInRHP && shouldUseNarrowLayout)}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
                shouldEnableDetailPageNavigation
                openParentReportInCurrentTab
            >
                {shouldDisplayNarrowMoreButton && (
                    <MoneyReportHeaderActions
                        reportID={reportIDProp}
                        primaryAction={primaryAction}
                        isReportInSearch={isReportInSearch}
                        backTo={backTo}
                    />
                )}
            </HeaderWithBackButton>
            {!shouldDisplayNarrowMoreButton && (
                <MoneyReportHeaderActions
                    reportID={reportIDProp}
                    primaryAction={primaryAction}
                    isReportInSearch={isReportInSearch}
                    backTo={backTo}
                />
            )}
            <MoneyReportHeaderMoreContent reportID={reportIDProp} />
            <HeaderLoadingBar />
        </View>
    );
}

export default MoneyReportHeader;
