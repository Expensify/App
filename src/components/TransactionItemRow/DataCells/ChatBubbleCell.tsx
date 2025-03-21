import React, {useMemo} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {ChatBubbleCounter} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, isChatThread} from '@libs/ReportUtils';
import variables from '@styles/variables';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

const isReportUnread = ({lastReadTime = '', lastVisibleActionCreated = '', lastMentionedTime = ''}: Report): boolean =>
    lastReadTime < lastVisibleActionCreated || lastReadTime < (lastMentionedTime ?? '');

/*
 * Child is retrieved because we want to get the unread status & messages count of the expense, not the report itself.
 * We can get the child's message count from the report, but we cannot get the child's unread info from there.
 */
function getTransactionMessagesCountAndUnreadInfo(transaction: Transaction) {
    const iouReportAction = getIOUActionForReportID(transaction.reportID, transaction.transactionID);
    const childReport = iouReportAction ? getReportOrDraftReport(iouReportAction.childReportID) : undefined;

    return {
        count: (iouReportAction && iouReportAction.childVisibleActionCount) ?? 0,
        isUnread: isChatThread(childReport) && isReportUnread(childReport),
    };
}

function ChatBubbleCell({transaction}: {transaction: Transaction}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const threadMessages = useMemo(() => getTransactionMessagesCountAndUnreadInfo(transaction), [transaction]);
    const StyleUtils = useStyleUtils();

    const elementSize = shouldUseNarrowLayout ? variables.iconSizeSmall : variables.iconSizeNormal;
    const fontSize = shouldUseNarrowLayout ? variables.fontSizeXXSmall : variables.fontSizeExtraSmall;

    return (
        threadMessages.count > 0 && (
            <View style={[styles.dFlex, styles.alignItemsCenter, styles.justifyContentCenter, styles.textAlignCenter, StyleUtils.getWidthAndHeightStyle(elementSize)]}>
                <Icon
                    src={ChatBubbleCounter}
                    additionalStyles={[styles.pAbsolute]}
                    fill={threadMessages.isUnread ? theme.iconMenu : theme.icon}
                    width={elementSize}
                    height={elementSize}
                />
                <Text
                    style={[
                        styles.textBold,
                        StyleUtils.getLineHeightStyle(variables.lineHeightXSmall),
                        StyleUtils.getColorStyle(theme.appBG),
                        StyleUtils.getFontSizeStyle(fontSize),
                        {top: -1},
                    ]}
                >
                    {threadMessages.count > 99 ? '99+' : threadMessages.count}
                </Text>
            </View>
        )
    );
}

ChatBubbleCell.displayName = 'ChatBubbleCell';

export default ChatBubbleCell;
