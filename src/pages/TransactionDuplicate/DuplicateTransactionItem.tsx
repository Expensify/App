import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

type DuplicateTransactionItemProps = {
    transaction: OnyxEntry<Transaction>;
    index: number;
};

function DuplicateTransactionItem(props: DuplicateTransactionItemProps) {
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.transaction?.reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/non-nullable-type-assertion-style
    const action = Object.values(reportActions ?? {})?.find((reportAction) => {
        const IOUTransactionID = ReportActionsUtils.isMoneyRequestAction(reportAction) ? ReportActionsUtils.getOriginalMessage(reportAction)?.IOUTransactionID : -1;
        return IOUTransactionID === props.transaction?.transactionID;
    });

    if (!action || !report) {
        return null;
    }

    return (
        <View style={styles.pb2}>
            <ReportActionItem
                action={action}
                report={report}
                parentReportAction={ReportActionsUtils.getReportAction(report?.parentReportID, report?.parentReportActionID)}
                index={props.index}
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
