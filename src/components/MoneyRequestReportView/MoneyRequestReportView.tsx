import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import HeaderGap from '@components/HeaderGap';
import MoneyReportHeader from '@components/MoneyReportHeader';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditReportAction, getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import ReportFooter from '@pages/home/report/ReportFooter';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportActionsList from './MoneyRequestReportActionsList';

type MoneyRequestReportViewProps = {
    /** The report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Metadata for report */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** Current policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether Report footer (that includes Composer) should be displayed */
    shouldDisplayReportFooter: boolean;
};

function getParentReportAction(parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, parentReportActionID: string | undefined): OnyxEntry<OnyxTypes.ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}

const noOp = () => {};

function MoneyRequestReportView({report, policy, reportMetadata, shouldDisplayReportFooter}: MoneyRequestReportViewProps) {
    const styles = useThemeStyles();

    const reportID = report?.reportID;
    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, {initialValue: false});
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);

    const {
        reportActions,
        hasNewerActions,
        hasOlderActions,
        // sortedAllReportActions,
    } = usePaginatedReportActions(reportID);

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {
        canEvict: false,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, report?.parentReportActionID),
    });

    const lastReportAction = [...reportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));

    if (!report) {
        return;
    }

    return (
        <View style={styles.flex1}>
            <HeaderGap />
            <MoneyReportHeader
                report={report}
                policy={policy}
                reportActions={[]}
                transactionThreadReportID={undefined}
                shouldDisplayBackButton
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />
            <MoneyRequestReportActionsList
                report={report}
                reportActions={reportActions}
                hasOlderActions={hasOlderActions}
                hasNewerActions={hasNewerActions}
            />
            {shouldDisplayReportFooter ? (
                <ReportFooter
                    onComposerFocus={noOp}
                    onComposerBlur={noOp}
                    report={report}
                    reportMetadata={reportMetadata}
                    policy={policy}
                    pendingAction={reportPendingAction}
                    isComposerFullSize={!!isComposerFullSize}
                    lastReportAction={lastReportAction}
                />
            ) : null}
        </View>
    );
}

MoneyRequestReportView.displayName = 'MoneyRequestReportView';

export default MoneyRequestReportView;
