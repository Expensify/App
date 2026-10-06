import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import type {MoneyReportHeaderActionsProps} from './MoneyReportHeaderActions/types';

import MoneyReportHeaderActions from './MoneyReportHeaderActions';
import MoneyReportHeaderNextStep from './MoneyReportHeaderNextStep';
import MoneyReportHeaderStatusBarSection from './MoneyReportHeaderStatusBarSection';
import {useMoneyReportTransactionThread} from './MoneyReportTransactionThreadContext';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';

type MoneyReportHeaderMoreContentProps = {
    reportID: string | undefined;

    /** The report's primary action, forwarded to the actions row */
    primaryAction: MoneyReportHeaderActionsProps['primaryAction'];

    /** Route to navigate back to */
    backTo: Route | undefined;

    /** Which status bar to render, resolved by the header via useMoneyReportHeaderMoreContentVisibility */
    statusBarType: ValueOf<typeof CONST.REPORT.STATUS_BAR_TYPE> | undefined;

    /** Whether the next step bar should be rendered, resolved alongside `statusBarType` */
    shouldShowNextStep: boolean;

    /** Whether the report actions belong at the end of this row. The header renders them itself when this row is empty. */
    shouldRenderActionsInRow: boolean;

    /** Whether the report prev/next arrows belong at the end of this row. Only true while the expense carousel beta is off. */
    shouldRenderReportNavigationInRow: boolean;

    /** Whether the report prev/next arrows in this row hide their counter */
    shouldDisplayNarrowReportNavigation: boolean;
};

/**
 * Cheap visibility gate that decides whether the more-content section should render at all,
 * avoiding expensive hooks in the body when nothing is shown.
 */
function MoneyReportHeaderMoreContent({
    reportID,
    primaryAction,
    backTo,
    statusBarType,
    shouldShowNextStep,
    shouldRenderActionsInRow,
    shouldRenderReportNavigationInRow,
    shouldDisplayNarrowReportNavigation,
}: MoneyReportHeaderMoreContentProps) {
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const hasStatusOrNextStep = shouldShowNextStep || !!statusBarType;
    const shouldShowMoreContent = hasStatusOrNextStep || shouldRenderActionsInRow || shouldRenderReportNavigationInRow;

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
            shouldRenderReportNavigationInRow={shouldRenderReportNavigationInRow}
            shouldDisplayNarrowReportNavigation={shouldDisplayNarrowReportNavigation}
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
    shouldRenderReportNavigationInRow: boolean;
    shouldDisplayNarrowReportNavigation: boolean;
};

function MoneyReportHeaderMoreContentBody({
    moneyRequestReport,
    statusBarType,
    isReportInSearch,
    shouldShowNextStep,
    primaryAction,
    backTo,
    shouldRenderActionsInRow,
    shouldRenderReportNavigationInRow,
    shouldDisplayNarrowReportNavigation,
}: MoneyReportHeaderMoreContentBodyProps) {
    const styles = useThemeStyles();

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
            {shouldRenderActionsInRow && (
                <MoneyReportHeaderActions
                    reportID={reportID}
                    primaryAction={primaryAction}
                    isReportInSearch={isReportInSearch}
                    backTo={backTo}
                />
            )}
            {shouldRenderReportNavigationInRow && (
                <MoneyRequestReportNavigation
                    reportID={reportID}
                    shouldDisplayNarrowVersion={shouldDisplayNarrowReportNavigation}
                />
            )}
        </View>
    );
}

export default MoneyReportHeaderMoreContent;
