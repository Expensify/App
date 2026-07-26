import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getLinkedTransactionID, getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';
import {getIOUReportActionDisplayMessage} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';

import ReportActionMessageContent from './ReportActionMessageContent';

type IouReportActionMessageProps = {
    /** The report action */
    action: ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Additional styles to add after local styles. */
    style?: StyleProp<ViewStyle & TextStyle>;

    /** Whether or not the message is hidden by moderation */
    isHidden?: boolean;

    /** The ID of the report */
    reportID: string | undefined;
};

function IouReportActionMessage({action, displayAsGroup, reportID, style, isHidden = false}: IouReportActionMessageProps) {
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(getLinkedTransactionID(action))}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    let iouMessage: string | undefined;
    const isIOUAction = isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU);
    const originalMessageType = isIOUAction ? getOriginalMessage(action)?.type : undefined;
    if (isIOUAction && originalMessageType !== CONST.IOU.REPORT_ACTION_TYPE.TRACK) {
        iouMessage = getIOUReportActionDisplayMessage(translate, action, transaction, report, bankAccountList);
    }

    return (
        <ReportActionMessageContent
            action={action}
            displayAsGroup={displayAsGroup}
            reportID={reportID}
            style={style}
            isHidden={isHidden}
            iouMessage={iouMessage}
        />
    );
}

export default IouReportActionMessage;
