import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {isGroupPolicy} from '@libs/PolicyUtils';
import {isInvoiceReport as isInvoiceReportUtil} from '@libs/ReportUtils';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyReportHeaderActions from './MoneyReportHeaderActions';
import type {MoneyReportHeaderActionsProps} from './MoneyReportHeaderActions/types';
import MoneyReportHeaderNextStep from './MoneyReportHeaderNextStep';
import MoneyReportHeaderStatusBarSection from './MoneyReportHeaderStatusBarSection';
import {useMoneyReportTransactionThread} from './MoneyReportTransactionThreadContext';

type MoneyReportHeaderMoreContentProps = {
    reportID: string | undefined;
    primaryAction: MoneyReportHeaderActionsProps['primaryAction'];
    backTo: Route | undefined;
    shouldShowHeaderButtonsInHeaderRow: boolean;
};

/**
 * Cheap visibility gate — fetches minimal data to decide whether the more-content section
 * should render at all, avoiding expensive hooks in the body when nothing is shown.
 */
function MoneyReportHeaderMoreContent({reportID, primaryAction, backTo, shouldShowHeaderButtonsInHeaderRow}: MoneyReportHeaderMoreContentProps) {
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
    const hasStatusOrNextStep = shouldShowNextStep || !!statusBarType;
    const shouldRenderActionsInRow = shouldShowHeaderButtonsInHeaderRow;

    const shouldShowMoreContent = hasStatusOrNextStep || shouldRenderActionsInRow;

    if (!shouldShowMoreContent) {
        return null;
    }

    return (
        <MoneyReportHeaderMoreContentBody
            moneyRequestReport={moneyRequestReport}
            statusBarType={statusBarType}
            isReportInSearch={isReportInSearch}
            shouldShowNextStep={shouldShowNextStep}
            primaryAction={primaryAction}
            backTo={backTo}
            shouldRenderActionsInRow={shouldRenderActionsInRow}
        />
    );
}

type MoneyReportHeaderMoreContentBodyProps = {
    moneyRequestReport: OnyxEntry<OnyxTypes.Report>;
    statusBarType: ValueOf<typeof CONST.REPORT.STATUS_BAR_TYPE> | undefined;
    isReportInSearch: boolean;
    shouldShowNextStep: boolean;
    primaryAction: MoneyReportHeaderActionsProps['primaryAction'];
    backTo: Route | undefined;
    shouldRenderActionsInRow: boolean;
};

function MoneyReportHeaderMoreContentBody({
    moneyRequestReport,
    statusBarType,
    isReportInSearch,
    shouldShowNextStep,
    primaryAction,
    backTo,
    shouldRenderActionsInRow,
}: MoneyReportHeaderMoreContentBodyProps) {
    const styles = useThemeStyles();

    const reportID = moneyRequestReport?.reportID;
    const {iouTransactionID} = useMoneyReportTransactionThread();

    return (
        <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3, styles.mtn1, shouldShowNextStep && styles.pt0]}>
            <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                {shouldShowNextStep && <MoneyReportHeaderNextStep reportID={reportID} />}
                <MoneyReportHeaderStatusBarSection
                    reportID={reportID}
                    statusBarType={statusBarType}
                    iouTransactionID={iouTransactionID}
                />
            </View>
            {shouldRenderActionsInRow && (
                <MoneyReportHeaderActions
                    reportID={reportID}
                    primaryAction={primaryAction}
                    isReportInSearch={isReportInSearch}
                    backTo={backTo}
                />
            )}
        </View>
    );
}

export default MoneyReportHeaderMoreContent;
