import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import {ChatBubbleCounter} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isChatThread} from '@libs/ReportUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

const isReportUnread = ({lastReadTime = '', lastVisibleActionCreated = '', lastMentionedTime = ''}: Report): boolean =>
    lastReadTime < lastVisibleActionCreated || lastReadTime < (lastMentionedTime ?? '');

const ChatBubbleCell = memo(function ChatBubbleCell({
    transaction,
    containerStyles,
    isInSingleTransactionReport,
}: {
    transaction: Transaction;
    containerStyles?: ViewStyle[];
    isInSingleTransactionReport?: boolean;
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // Optimize Onyx subscriptions by using more specific selectors
    const [iouReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`, {
        selector: (reportActions) => {
            if (!reportActions) return null;
            const action = getIOUActionForTransactionID(Object.values(reportActions), transaction.transactionID);
            return action ? {childReportID: action.childReportID, childVisibleActionCount: action.childVisibleActionCount} : null;
        },
        canBeMissing: true,
    });

    const [transactionReport] = useOnyx(
        isInSingleTransactionReport ? `${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}` : `${ONYXKEYS.COLLECTION.REPORT}${iouReportAction?.childReportID}`,
        {
            selector: (report) =>
                report
                    ? {
                          lastReadTime: report.lastReadTime,
                          lastVisibleActionCreated: report.lastVisibleActionCreated,
                          lastMentionedTime: report.lastMentionedTime,
                          reportType: report.reportType,
                          chatType: report.chatType,
                          participantAccountIDs: report.participantAccountIDs,
                      }
                    : null,
            canBeMissing: true,
        },
    );

    const threadMessages = useMemo(() => {
        const count = iouReportAction?.childVisibleActionCount ?? 0;
        if (count === 0) return {count: 0, isUnread: false};

        return {
            count,
            isUnread: transactionReport ? isChatThread(transactionReport) && isReportUnread(transactionReport) : false,
        };
    }, [iouReportAction?.childVisibleActionCount, transactionReport]);

    // Memoize style calculations
    const {iconSize, fontSize, displayText} = useMemo(() => {
        const iconSz = shouldUseNarrowLayout ? variables.iconSizeSmall : variables.iconSizeNormal;
        const fontSz = shouldUseNarrowLayout ? variables.fontSizeXXSmall : variables.fontSizeExtraSmall;
        const text = threadMessages.count > 99 ? '99+' : threadMessages.count.toString();

        return {
            iconSize: iconSz,
            fontSize: fontSz,
            displayText: text,
        };
    }, [shouldUseNarrowLayout, threadMessages.count]);

    // Early return if no messages to avoid unnecessary rendering
    if (threadMessages.count === 0) {
        return null;
    }

    return (
        <View style={[styles.dFlex, styles.alignItemsCenter, styles.justifyContentCenter, styles.textAlignCenter, StyleUtils.getWidthAndHeightStyle(iconSize), containerStyles]}>
            <Icon
                src={ChatBubbleCounter}
                additionalStyles={[styles.pAbsolute]}
                fill={threadMessages.isUnread ? theme.iconMenu : theme.icon}
                width={iconSize}
                height={iconSize}
            />
            <Text
                style={[styles.textBold, StyleUtils.getLineHeightStyle(variables.lineHeightXSmall), StyleUtils.getColorStyle(theme.appBG), StyleUtils.getFontSizeStyle(fontSize), {top: -1}]}
            >
                {displayText}
            </Text>
        </View>
    );
});

ChatBubbleCell.displayName = 'ChatBubbleCell';

export default ChatBubbleCell;
