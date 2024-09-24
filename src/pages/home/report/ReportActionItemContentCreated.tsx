import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
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
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import ReportActionItemCreated from './ReportActionItemCreated';
import ReportActionItemSingle from './ReportActionItemSingle';

type ReportActionItemContentCreatedProps = {
    /**  The context value containing the report and action data, along with the show context menu props */
    contextValue: ShowContextMenuContextProps & {
        report: OnyxTypes.Report;
        action: OnyxTypes.ReportAction;
    };

    /** Report action belonging to the report's parent */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The transaction ID */
    transactionID: string | undefined;

    /** The draft message */
    draftMessage: string | undefined;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine: boolean;
};

function ReportActionItemContentCreated({contextValue, parentReportAction, transactionID, draftMessage, shouldHideThreadDividerLine}: ReportActionItemContentCreatedProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {report, action, transactionThreadReport} = contextValue;

    const policy = usePolicy(report.policyID === CONST.POLICY.OWNER_EMAIL_FAKE ? '-1' : report.policyID ?? '-1');
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID ?? '-1'}`);

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
        [shouldHideThreadDividerLine, report.reportID, styles.reportHorizontalRule],
    );

    if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
        const isReversedTransaction = ReportActionsUtils.isReversedTransaction(parentReportAction);

        if (ReportActionsUtils.isMessageDeleted(parentReportAction) || isReversedTransaction) {
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
            <OfflineWithFeedback pendingAction={action.pendingAction}>
                <ShowContextMenuContext.Provider value={contextValue}>
                    <View>
                        <MoneyRequestView
                            report={report}
                            shouldShowAnimatedBackground
                        />
                        {renderThreadDivider}
                    </View>
                </ShowContextMenuContext.Provider>
            </OfflineWithFeedback>
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
                {!isEmptyObject(transactionThreadReport?.reportID) ? (
                    <>
                        <MoneyReportView
                            report={report}
                            policy={policy}
                            isCombinedReport
                            shouldShowTotal={transaction ? transactionCurrency !== report.currency : false}
                            shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                        />
                        <ShowContextMenuContext.Provider value={contextValue}>
                            <View>
                                <MoneyRequestView
                                    report={transactionThreadReport}
                                    shouldShowAnimatedBackground={false}
                                />
                                {renderThreadDivider}
                            </View>
                        </ShowContextMenuContext.Provider>
                    </>
                ) : (
                    <MoneyReportView
                        report={report}
                        policy={policy}
                        shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    />
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

export default memo(
    ReportActionItemContentCreated,
    (prevProps, nextProps) =>
        lodashIsEqual(prevProps.contextValue, nextProps.contextValue) &&
        lodashIsEqual(prevProps.parentReportAction, nextProps.parentReportAction) &&
        prevProps.transactionID === nextProps.transactionID &&
        prevProps.draftMessage === nextProps.draftMessage &&
        prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine,
);
