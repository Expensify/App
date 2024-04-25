import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type DuplicateTransactionItemProps = {
    transactionID: string;
    index: number;
};

function DuplicateTransactionItem({transactionID, index}: DuplicateTransactionItemProps) {
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`);
    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID ?? '', report?.parentReportActionID ?? '');

    return (
        <View>
            <ReportActionItem
                transactionThreadReport={transactionThreadReport}
                action={Object.values(reportActions ?? {})?.find((reportAction) => reportAction.actionName === 'IOU' && reportAction.originalMessage.IOUTransactionID === transactionID)}
                report={report}
                parentReportAction={parentReportAction}
                index={index}
            />
        </View>
    );
}

export default DuplicateTransactionItem;
