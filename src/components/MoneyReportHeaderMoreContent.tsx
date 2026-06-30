import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {isGroupPolicy} from '@libs/PolicyUtils';
import {isInvoiceReport as isInvoiceReportUtil} from '@libs/ReportUtils';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyReportHeaderNextStep from './MoneyReportHeaderNextStep';
import MoneyReportHeaderStatusBarSection from './MoneyReportHeaderStatusBarSection';
import {useMoneyReportTransactionThread} from './MoneyReportTransactionThreadContext';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';

type MoneyReportHeaderMoreContentProps = {
    reportID: string | undefined;
};

/**
 * Cheap visibility gate — fetches minimal data to decide whether the more-content section
 * should render at all, avoiding expensive hooks in the body when nothing is shown.
 */
function MoneyReportHeaderMoreContent({reportID}: MoneyReportHeaderMoreContentProps) {
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const {shouldShowStatusBar, statusBarType} = useMoneyReportHeaderStatusBar(reportID, moneyRequestReport?.chatReportID);

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);
    const shouldShowNextStep = isGroupPolicy(policy) && !isInvoiceReport && !shouldShowStatusBar;

    const shouldShowMoreContent = shouldShowNextStep || !!statusBarType || isReportInSearch;

    if (!shouldShowMoreContent) {
        return null;
    }

    return (
        <MoneyReportHeaderMoreContentBody
            moneyRequestReport={moneyRequestReport}
            statusBarType={statusBarType}
            isReportInSearch={isReportInSearch}
            shouldShowNextStep={shouldShowNextStep}
        />
    );
}

type MoneyReportHeaderMoreContentBodyProps = {
    moneyRequestReport: OnyxEntry<OnyxTypes.Report>;
    statusBarType: ValueOf<typeof CONST.REPORT.STATUS_BAR_TYPE> | undefined;
    isReportInSearch: boolean;
    shouldShowNextStep: boolean;
};

function MoneyReportHeaderMoreContentBody({moneyRequestReport, statusBarType, isReportInSearch, shouldShowNextStep}: MoneyReportHeaderMoreContentBodyProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();
    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const reportID = moneyRequestReport?.reportID;
    const {iouTransactionID} = useMoneyReportTransactionThread();

    return (
        <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3]}>
            <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                {shouldShowNextStep && <MoneyReportHeaderNextStep reportID={reportID} />}
                <MoneyReportHeaderStatusBarSection
                    reportID={reportID}
                    statusBarType={statusBarType}
                    iouTransactionID={iouTransactionID}
                />
            </View>
            {isReportInSearch && (
                <MoneyRequestReportNavigation
                    reportID={reportID}
                    shouldDisplayNarrowVersion={!shouldDisplayNarrowMoreButton}
                />
            )}
        </View>
    );
}

export default MoneyReportHeaderMoreContent;
