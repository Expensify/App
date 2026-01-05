import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
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
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isMessageDeleted, isReversedTransaction as isReversedTransactionReportActionsUtils, isTransactionThread} from '@libs/ReportActionsUtils';
import {isCanceledTaskReport, isExpenseReport, isInvoiceReport, isIOUReport, isTaskReport} from '@libs/ReportUtils';
import {getCurrency} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import ReportActionItemCreated from './ReportActionItemCreated';
import ReportActionItemSingle from './ReportActionItemSingle';

type ReportActionItemContentCreatedProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<OnyxTypes.Report>;

    /**  The context value containing the report and action data, along with the show context menu props */
    contextValue: ShowContextMenuContextProps;

    /** The parent report */
    parentReport: OnyxEntry<OnyxTypes.Report>;

    /** Report action belonging to the report's parent */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The transaction ID */
    transactionID: string | undefined;

    /** The draft message */
    draftMessage: string | undefined;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine: boolean;
};

function ReportActionItemContentCreated({
    contextValue,
    allReports,
    parentReport,
    parentReportAction,
    transactionID,
    draftMessage,
    shouldHideThreadDividerLine,
}: ReportActionItemContentCreatedProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {report, action, transactionThreadReport} = contextValue;
    const policy = usePolicy(report?.policyID === CONST.POLICY.OWNER_EMAIL_FAKE ? undefined : report?.policyID);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});

    const transactionCurrency = getCurrency(transaction);

    const renderThreadDivider = useMemo(
        () =>
            shouldHideThreadDividerLine ? (
                <UnreadActionIndicator
                    reportActionID={report?.reportID}
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                />
            ) : (
                <SpacerView
                    shouldShow={!shouldHideThreadDividerLine}
                    style={[!shouldHideThreadDividerLine ? styles.reportHorizontalRule : {}]}
                />
            ),
        [shouldHideThreadDividerLine, report?.reportID, styles.reportHorizontalRule],
    );

    const contextMenuValue = useMemo(() => ({...contextValue, isDisabled: true}), [contextValue]);

    if (isTransactionThread(parentReportAction)) {
        const isReversedTransaction = isReversedTransactionReportActionsUtils(parentReportAction);

        if (isMessageDeleted(parentReportAction) || isReversedTransaction) {
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
                            <RenderHTML html={`<deleted-action ${CONST.REVERSED_TRANSACTION_ATTRIBUTE}="${isReversedTransaction}">${translate(message)}</deleted-action>`} />
                        </ReportActionItemSingle>
                        <View style={styles.threadDividerLine} />
                    </OfflineWithFeedback>
                </View>
            );
        }

        return (
            <OfflineWithFeedback pendingAction={action?.pendingAction}>
                <ShowContextMenuContext.Provider value={contextMenuValue}>
                    <View>
                        <MoneyRequestView
                            allReports={allReports}
                            transactionThreadReport={report}
                            parentReportID={report?.parentReportID}
                            expensePolicy={policy}
                            shouldShowAnimatedBackground
                        />
                        {renderThreadDivider}
                    </View>
                </ShowContextMenuContext.Provider>
            </OfflineWithFeedback>
        );
    }

    if (isTaskReport(report)) {
        if (isCanceledTaskReport(report, parentReportAction)) {
            return (
                <View style={[styles.pRelative]}>
                    <AnimatedEmptyStateBackground />
                    <OfflineWithFeedback pendingAction={parentReportAction?.pendingAction}>
                        <ReportActionItemSingle
                            action={parentReportAction}
                            showHeader={draftMessage === undefined}
                            report={report}
                        >
                            <RenderHTML html={`<deleted-action>${translate('parentReportAction.deletedTask')}</deleted-action>`} />
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
                    <TaskView
                        report={report}
                        parentReport={parentReport}
                        action={action}
                    />
                    {renderThreadDivider}
                </View>
            </View>
        );
    }

    if (isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report)) {
        return (
            <OfflineWithFeedback pendingAction={action?.pendingAction}>
                {!isEmptyObject(transactionThreadReport?.reportID) ? (
                    <>
                        <MoneyReportView
                            report={report}
                            policy={policy}
                            isCombinedReport
                            pendingAction={action?.pendingAction}
                            shouldShowTotal={transaction ? transactionCurrency !== report?.currency : false}
                            shouldHideThreadDividerLine={false}
                        />
                        <ShowContextMenuContext.Provider value={contextMenuValue}>
                            <View>
                                <MoneyRequestView
                                    allReports={allReports}
                                    transactionThreadReport={transactionThreadReport}
                                    parentReportID={transactionThreadReport?.parentReportID}
                                    expensePolicy={policy}
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
                        pendingAction={action?.pendingAction}
                        shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    />
                )}
            </OfflineWithFeedback>
        );
    }

    return (
        <ReportActionItemCreated
            reportID={report?.reportID}
            policyID={report?.policyID}
        />
    );
}

export default memo(
    ReportActionItemContentCreated,
    (prevProps, nextProps) =>
        prevProps.contextValue === nextProps.contextValue &&
        prevProps.parentReportAction === nextProps.parentReportAction &&
        prevProps.transactionID === nextProps.transactionID &&
        prevProps.draftMessage === nextProps.draftMessage &&
        prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine,
);
