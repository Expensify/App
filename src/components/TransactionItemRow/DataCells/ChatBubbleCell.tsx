import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {ChatBubble} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOUActionForReportID, getReportAction} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, isChatThread} from '@libs/ReportUtils';
import type Transaction from '@src/types/onyx/Transaction';

type MessagesCountAndStatus = {
    reportID: string | undefined;
    count: number;
    isUnread: boolean;
};

function getTransactionMessagesCountAndUnreadInfo(transaction: Transaction) {
    const result: MessagesCountAndStatus = {
        reportID: undefined,
        count: 0,
        isUnread: false,
    };

    const iouReport = getIOUActionForReportID(transaction.reportID, transaction.transactionID);

    if (!iouReport) {
        return result;
    }

    const count = iouReport.childVisibleActionCount;
    const action = getReportAction(transaction.reportID, iouReport.reportActionID);

    if (!action) {
        return result;
    }

    result.reportID = action.reportID;

    if (!count) {
        return result;
    }

    result.count = count;

    const {childReportID} = action;
    const reportOrDraftReport = getReportOrDraftReport(childReportID);
    const isThread = isChatThread(reportOrDraftReport);

    if (!isThread) {
        return result;
    }

    const {lastReadTime = '', lastMentionedTime = '', lastVisibleActionCreated = ''} = reportOrDraftReport;
    result.isUnread = lastReadTime < lastVisibleActionCreated || lastReadTime < (lastMentionedTime ?? '');

    return result;
}

function ChatBubbleCell({transaction}: {transaction: Transaction}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const threadMessages = getTransactionMessagesCountAndUnreadInfo(transaction);

    return (
        threadMessages.count > 0 && (
            <View style={[styles.dFlex, styles.alignItemsCenter, styles.justifyContentCenter, {width: 24, height: 20, verticalAlign: 'middle', textAlign: 'center'}]}>
                <Icon
                    src={ChatBubble}
                    additionalStyles={{position: 'absolute'}}
                    fill={threadMessages.isUnread ? theme.iconMenu : theme.icon}
                    width={20}
                    height={24}
                />
                <Text style={{fontSize: 9, lineHeight: 12, fontWeight: 'bold', color: theme.appBG}}>{threadMessages.count}</Text>
            </View>
        )
    );
}

ChatBubbleCell.displayName = 'ChatBubbleCell';

export default ChatBubbleCell;
