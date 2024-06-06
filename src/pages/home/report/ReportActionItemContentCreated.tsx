import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import MoneyReportView from '@components/ReportActionItem/MoneyReportView';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import TaskView from '@components/ReportActionItem/TaskView';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import type {ShowContextMenuContextProps} from '@components/ShowContextMenuContext';
import SpacerView from '@components/SpacerView';
import UnreadActionIndicator from '@components/UnreadActionIndicator';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import ReportActionItemCreated from './ReportActionItemCreated';
import ReportActionItemSingle from './ReportActionItemSingle';

type ReportActionItemProps = {
    report: OnyxTypes.Report;
    action: OnyxTypes.ReportAction;
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;
    contextValue: ShowContextMenuContextProps;
    draftMessage: string | undefined;
    shouldHideThreadDividerLine: boolean;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function ReportActionItemContentCreated({
    report,
    action,
    parentReportAction,
    contextValue,
    draftMessage,
    shouldHideThreadDividerLine,
    transaction,
    transactionThreadReport,
    policy,
}: ReportActionItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const transactionCurrency = TransactionUtils.getCurrency(transaction);

    const renderThreadDivider = useMemo(
        () =>
            shouldHideThreadDividerLine ? (
                <UnreadActionIndicator
                    reportActionID={report.reportID}
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                />
            ) : (
                <SpacerView
                    shouldShow={!shouldHideThreadDividerLine}
                    style={[!shouldHideThreadDividerLine ? styles.reportHorizontalRule : {}]}
                />
            ),
        [shouldHideThreadDividerLine, styles.reportHorizontalRule, report.reportID],
    );

    if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
        const isReversedTransaction = ReportActionsUtils.isReversedTransaction(parentReportAction);

        if (ReportActionsUtils.isDeletedParentAction(parentReportAction) || isReversedTransaction) {
            let message: TranslationPaths;

            if (isReversedTransaction) {
                message = 'parentReportAction.reversedTransaction';
            } else {
                message = 'parentReportAction.deletedExpense';
            }

            return (
                <View style={[styles.pRelative]}>
                    <AnimatedEmptyStateBackground />
                    <OfflineWithFeedback pendingAction={parentReportAction?.pendingAction ?? null}>
                        <ReportActionItemSingle
                            action={parentReportAction}
                            showHeader
                            report={report}
                        >
                            <RenderHTML html={`<comment>${translate(message)}</comment>`} />
                        </ReportActionItemSingle>
                        <View style={styles.threadDividerLine} />
                    </OfflineWithFeedback>
                </View>
            );
        }

        return (
            <ShowContextMenuContext.Provider value={contextValue}>
                <View>
                    <MoneyRequestView
                        report={report}
                        shouldShowAnimatedBackground
                    />
                    {renderThreadDivider}
                </View>
            </ShowContextMenuContext.Provider>
        );
    }

    if (ReportUtils.isTaskReport(report)) {
        if (ReportUtils.isCanceledTaskReport(report, parentReportAction)) {
            return (
                <View style={[styles.pRelative]}>
                    <AnimatedEmptyStateBackground />
                    <OfflineWithFeedback pendingAction={parentReportAction?.pendingAction}>
                        <ReportActionItemSingle
                            action={parentReportAction}
                            showHeader={draftMessage === undefined}
                            report={report}
                        >
                            <RenderHTML html={`<comment>${translate('parentReportAction.deletedTask')}</comment>`} />
                        </ReportActionItemSingle>
                    </OfflineWithFeedback>
                    <View style={styles.reportHorizontalRule} />
                </View>
            );
        }

        return (
            <View style={[styles.pRelative]}>
                <AnimatedEmptyStateBackground />
                <View>
                    <TaskView report={report} />
                    {renderThreadDivider}
                </View>
            </View>
        );
    }

    if (ReportUtils.isExpenseReport(report) || ReportUtils.isIOUReport(report) || ReportUtils.isInvoiceReport(report)) {
        return (
            <OfflineWithFeedback pendingAction={action.pendingAction}>
                {transactionThreadReport && !isEmptyObject(transactionThreadReport) ? (
                    <>
                        {transactionCurrency !== report.currency && (
                            <>
                                <MoneyReportView
                                    report={report}
                                    policy={policy}
                                />
                                {renderThreadDivider}
                            </>
                        )}
                        <ShowContextMenuContext.Provider value={contextValue}>
                            <View>
                                <MoneyRequestView
                                    report={transactionThreadReport}
                                    shouldShowAnimatedBackground={transactionCurrency === report.currency}
                                />
                                {renderThreadDivider}
                            </View>
                        </ShowContextMenuContext.Provider>
                    </>
                ) : (
                    <>
                        <MoneyReportView
                            report={report}
                            policy={policy}
                        />
                        {renderThreadDivider}
                    </>
                )}
            </OfflineWithFeedback>
        );
    }

    return (
        <ReportActionItemCreated
            reportID={report.reportID}
            policyID={report.policyID}
        />
    );
}

ReportActionItemContentCreated.displayName = 'ReportActionItemContentCreated';

export default memo<ReportActionItemProps>(
    ReportActionItemContentCreated,
    (prevProps, nextProps) =>
        lodashIsEqual(prevProps.report, nextProps.report) &&
        lodashIsEqual(prevProps.action, nextProps.action) &&
        lodashIsEqual(prevProps.parentReportAction, nextProps.parentReportAction) &&
        lodashIsEqual(prevProps.contextValue, nextProps.contextValue) &&
        prevProps.draftMessage === nextProps.draftMessage &&
        prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine &&
        lodashIsEqual(prevProps.transaction, nextProps.transaction) &&
        lodashIsEqual(prevProps.transactionThreadReport, nextProps.transactionThreadReport) &&
        lodashIsEqual(prevProps.policy, nextProps.policy),
);
