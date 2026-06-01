import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import ReportActionItem from '@pages/inbox/report/ReportActionItem';
import {ReportActionItemActionsContext, ReportActionItemStateContext} from '@pages/inbox/report/ReportActionItemContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {getStableReportSelector} from '@src/selectors/Report';
import type {Transaction} from '@src/types/onyx';

type DuplicateTransactionItemProps = {
    transaction: OnyxEntry<Transaction>;
    onPreviewPressed: (reportID: string) => void;
};

const linkedTransactionRouteErrorSelector = (transaction: OnyxEntry<Transaction>) => transaction?.errorFields?.route ?? null;

function DuplicateTransactionItem({transaction, onPreviewPressed}: DuplicateTransactionItemProps) {
    const styles = useThemeStyles();

    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`, {selector: getStableReportSelector});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportStable?.reportID}`);

    const action = Object.values(reportActions ?? {})?.find((reportAction) => {
        const IOUTransactionID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUTransactionID : CONST.DEFAULT_NUMBER_ID;
        return IOUTransactionID === transaction?.transactionID;
    });

    const originalReportID = getOriginalReportID(reportStable?.reportID, action, reportActions);

    const [draftMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${action?.childReportID}`);

    const [linkedTransactionRouteError] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined)}`,
        {
            selector: linkedTransactionRouteErrorSelector,
        },
    );

    const stateValue = useMemo(() => ({shouldOpenReportInRHP: true}), []);
    const actionsValue = useMemo(() => ({onPreviewPressed}), [onPreviewPressed]);

    if (!action || !reportStable) {
        return null;
    }

    const reportDraftMessage = draftMessage?.[action.reportActionID];
    const matchingDraftMessage = reportDraftMessage?.message;

    return (
        <View style={styles.pb2}>
            <ReportActionItemStateContext.Provider value={stateValue}>
                <ReportActionItemActionsContext.Provider value={actionsValue}>
                    <ReportActionItem
                        action={action}
                        report={reportStable}
                        transactionThreadReport={transactionThreadReport}
                        parentReportAction={getReportAction(reportStable?.parentReportID, reportStable?.parentReportActionID)}
                        displayAsGroup={false}
                        shouldDisplayNewMarker={false}
                        isFirstVisibleReportAction={false}
                        shouldDisplayContextMenu={false}
                        draftMessage={matchingDraftMessage}
                        linkedTransactionRouteError={linkedTransactionRouteError}
                    />
                </ReportActionItemActionsContext.Provider>
            </ReportActionItemStateContext.Provider>
        </View>
    );
}

export default DuplicateTransactionItem;
