import React from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction, ReportActionsDrafts} from '@src/types/onyx';
import { getOriginalReportID } from '@libs/ReportUtils';



type DuplicateTransactionItemProps = {
    transaction: OnyxEntry<Transaction>;
    index: number;
    allReports: OnyxCollection<Report>;
    /** All the data of the policy collection */
    policies: OnyxCollection<Policy>;
};

function DuplicateTransactionItem({transaction, index, allReports, policies}: DuplicateTransactionItemProps) {
    const styles = useThemeStyles();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.validated, canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canBeMissing: false});

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/non-nullable-type-assertion-style
    const action = Object.values(reportActions ?? {})?.find((reportAction) => {
        const IOUTransactionID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUTransactionID : CONST.DEFAULT_NUMBER_ID;
        return IOUTransactionID === transaction?.transactionID;
    });

    const originalReportID = getOriginalReportID(report?.reportID, action);

    const [draftMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {
        canBeMissing: true});

    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action?.reportActionID}`, {
        canBeMissing: true,
    });

     const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID}`, {
        canBeMissing: true,
        selector: (transactionItem) => transactionItem?.errorFields?.route ?? null,
    });

    if (!action || !report) {
        return null;
    }

    return (
        <View style={styles.pb2}>
            <ReportActionItem
                allReports={allReports}
                policies={policies}
                action={action}
                report={report}
                parentReportAction={getReportAction(report?.parentReportID, report?.parentReportActionID)}
                index={index}
                reportActions={Object.values(reportActions ?? {})}
                displayAsGroup={false}
                shouldDisplayNewMarker={false}
                isMostRecentIOUReportAction={false}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
                userWallet={userWallet}
                isUserValidated={isUserValidated}
                personalDetails={personalDetails}
                draftMessage={draftMessage as OnyxEntry<string & ReportActionsDrafts>}
                emojiReactions={emojiReactions}
                linkedTransactionRouteError={linkedTransactionRouteError}
                userBillingFundID={userBillingFundID ?? 0}
            />
        </View>
    );
}

DuplicateTransactionItem.displayName = 'DuplicateTransactionItem';
export default DuplicateTransactionItem;
