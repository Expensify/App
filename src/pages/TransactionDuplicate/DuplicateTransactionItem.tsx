import React from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

type DuplicateTransactionItemProps = {
    transaction: OnyxEntry<Transaction>;
    index: number;
    allReports: OnyxCollection<Report>;
};

function DuplicateTransactionItem({transaction, index, allReports}: DuplicateTransactionItemProps) {
    const styles = useThemeStyles();
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canBeMissing: false});

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/non-nullable-type-assertion-style
    const action = Object.values(reportActions ?? {})?.find((reportAction) => {
        const IOUTransactionID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUTransactionID : CONST.DEFAULT_NUMBER_ID;
        return IOUTransactionID === transaction?.transactionID;
    });

    if (!action || !report) {
        return null;
    }

    return (
        <View style={styles.pb2}>
            <ReportActionItem
                allReports={allReports}
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
            />
        </View>
    );
}

DuplicateTransactionItem.displayName = 'DuplicateTransactionItem';
export default DuplicateTransactionItem;
