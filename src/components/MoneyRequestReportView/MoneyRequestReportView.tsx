/* eslint-disable no-nested-ternary */
import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import HeaderGap from '@components/HeaderGap';
import MoneyReportHeader from '@components/MoneyReportHeader';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import useNetwork from '@hooks/useNetwork';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOneTransactionThreadReportID, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditReportAction, getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import ReportActionsView from '@pages/home/report/ReportActionsView';
import ReportFooter from '@pages/home/report/ReportFooter';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {ThemeStyles} from '@src/styles';
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

    /** The `backTo` route that should be used when clicking back button */
    backToRoute: Route | undefined;
};

function InitialLoadingSkeleton({styles}: {styles: ThemeStyles}) {
    return (
        <View style={[styles.flex1]}>
            <View style={[styles.appContentHeader, styles.borderBottom]}>
                <ReportHeaderSkeletonView onBackButtonPress={() => {}} />
            </View>
            <ReportActionsSkeletonView />
        </View>
    );
}

function getParentReportAction(parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, parentReportActionID: string | undefined): OnyxEntry<OnyxTypes.ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}

function MoneyRequestReportView({report, policy, reportMetadata, shouldDisplayReportFooter, backToRoute}: MoneyRequestReportViewProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const reportID = report?.reportID;
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isComposerFullSize] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, {initialValue: false});
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);

    const {reportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID);
    const transactionThreadReportID = getOneTransactionThreadReportID(reportID, reportActions ?? [], isOffline);
    const shouldUseSingleTransactionView = useMemo(
        () =>
            reportActions.reduce((acc, action) => {
                if (action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                    return acc + 1;
                }
                return acc;
            }, 0) === 1,
        [reportActions],
    );

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {
        canEvict: false,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, report?.parentReportActionID),
    });

    const lastReportAction = [...reportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;

    if (isLoadingInitialReportActions && reportActions.length === 0 && !isOffline) {
        return <InitialLoadingSkeleton styles={styles} />;
    }

    if (reportActions.length === 0) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    if (!report) {
        return;
    }

    if (isLoadingApp) {
        return (
            <View style={styles.flex1}>
                <HeaderGap />
                <ReportHeaderSkeletonView />
                <ReportActionsSkeletonView />
                {shouldDisplayReportFooter ? (
                    <ReportFooter
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
                    Navigation.goBack(backToRoute);
                }}
            />
            {shouldUseSingleTransactionView ? (
                <ReportActionsView
                    report={report}
                    reportActions={reportActions}
                    isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
                    hasNewerActions={hasNewerActions}
                    hasOlderActions={hasOlderActions}
                    parentReportAction={parentReportAction}
                    transactionThreadReportID={transactionThreadReportID}
                />
            ) : (
                <MoneyRequestReportActionsList
                    report={report}
                    reportActions={reportActions}
                    hasOlderActions={hasOlderActions}
                    hasNewerActions={hasNewerActions}
                />
            )}
            {shouldDisplayReportFooter ? (
                <ReportFooter
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
