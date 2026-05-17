import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import MoneyReportView from '@components/ReportActionItem/MoneyReportView';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import type {ShowContextMenuActionsContextType, ShowContextMenuStateContextType} from '@components/ShowContextMenuContext';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import useReportTransactions from '@hooks/useReportTransactions';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSingleTransactionReport} from '@libs/MoneyRequestReportUtils';
import {getCurrency} from '@libs/TransactionUtils';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';

type MoneyReportContentCreatedProps = {
    /** The IOU/Expense/Invoice report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Policy that the report belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The transaction associated with the parent CREATED action, when applicable */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The transaction-thread report, if its data has already been subscribed via `useOnyx` */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** The CREATED report action that this content belongs to */
    action: OnyxEntry<OnyxTypes.ReportAction>;

    /** Context menu actions to forward to nested `MoneyRequestView` */
    contextMenuActionsValue: ShowContextMenuActionsContextType;

    /** Disabled context-menu state to forward to nested `MoneyRequestView` */
    disabledStateValue: ShowContextMenuStateContextType;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine: boolean;

    /** Pre-rendered thread divider node from the parent */
    threadDivider: React.ReactNode;
};

function MoneyReportContentCreated({
    report,
    policy,
    transaction,
    transactionThreadReport,
    action,
    contextMenuActionsValue,
    disabledStateValue,
    shouldHideThreadDividerLine,
    threadDivider,
}: MoneyReportContentCreatedProps) {
    const styles = useThemeStyles();
    const reportTransactions = useReportTransactions(report?.reportID);

    // After an expense is created in an empty IOU/expense report, there's a transient gap where
    // the transaction is in Onyx but the transaction-thread report's `useOnyx` subscription
    // hasn't yet delivered. During that gap the no-thread branch below would render
    // `MoneyReportView` against the report's stale `total` (0) and flash "Total $0.00". When
    // we detect that state, forward `isTotalPending` so `MoneyReportView` renders its loading
    // indicator in place of the amount until the thread arrives.
    const isPendingSingleExpenseThread = isSingleTransactionReport(report, reportTransactions) && !transactionThreadReport?.reportID;

    const hasThread = !!transactionThreadReport?.reportID;

    return (
        <OfflineWithFeedback pendingAction={action?.pendingAction}>
            {hasThread ? (
                <View style={[styles.pRelative, styles.moneyRequestView]}>
                    <AnimatedEmptyStateBackground />
                    <MoneyReportView
                        report={report}
                        policy={policy}
                        isCombinedReport
                        pendingAction={action?.pendingAction}
                        shouldShowTotal={!!transaction && getCurrency(transaction) !== report?.currency}
                        shouldHideThreadDividerLine={false}
                        shouldShowAnimatedBackground={false}
                    />
                    <ShowContextMenuStateContext.Provider value={disabledStateValue}>
                        <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
                            <View>
                                <MoneyRequestView
                                    transactionThreadReport={transactionThreadReport}
                                    parentReportID={transactionThreadReport?.parentReportID}
                                    expensePolicy={policy}
                                    shouldShowAnimatedBackground={false}
                                />
                                {threadDivider}
                            </View>
                        </ShowContextMenuActionsContext.Provider>
                    </ShowContextMenuStateContext.Provider>
                </View>
            ) : (
                <MoneyReportView
                    report={report}
                    policy={policy}
                    pendingAction={action?.pendingAction}
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    isTotalPending={isPendingSingleExpenseThread}
                />
            )}
        </OfflineWithFeedback>
    );
}

export default MoneyReportContentCreated;
