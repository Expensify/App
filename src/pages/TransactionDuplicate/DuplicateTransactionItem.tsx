import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

type DuplicateTransactionItemProps = {
    transaction: OnyxEntry<Transaction>;
    index: number;
};

function DuplicateTransactionItem(props: DuplicateTransactionItemProps) {
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.transaction?.reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`);
    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID ?? '', report?.parentReportActionID ?? '');

    return (
        <View style={styles.pb2}>
            <ReportActionItem
                action={
                    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                    Object.values(reportActions ?? {})?.find(
                        (reportAction) => reportAction.actionName === 'IOU' && reportAction.originalMessage.IOUTransactionID === props.transaction?.transactionID,
                    ) as ReportAction
                }
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                report={report as Report}
                parentReportAction={parentReportAction}
                index={props.index}
                reportActions={Object.values(reportActions ?? {})}
                displayAsGroup={false}
                shouldDisplayNewMarker={false}
                isMostRecentIOUReportAction={false}
                isFirstVisibleReportAction={false}
            />
        </View>
    );
}

export default DuplicateTransactionItem;
