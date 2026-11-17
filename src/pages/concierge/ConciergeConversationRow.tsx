/** A row of the Concierge page list, styled like an Inbox chat row in focus mode, without the avatar: the title, then the latest message as far as it fits. Each row reads its own data, so a change to one conversation only redraws that row. */
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ConciergeConversation} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportActionMessageText} from '@libs/ReportActionsUtils';
import {isUnread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type ConciergeConversationRowProps = {
    conversation: ConciergeConversation;

    /** The open report is this conversation or a thread nested in it */
    isSelected: boolean;

    onOpenThread: (reportID: string) => void;

    /** Opens a thread on a Concierge message that has none yet */
    onOpenMessage: (message: ReportAction) => void;
};

type ConciergeConversationRowContentProps = {
    title: string;

    /** The most recent message, whose first sentence follows the title as far as it fits */
    lastMessage: string;

    isUnread: boolean;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    isSelected: boolean;

    onPress: () => void;
};

// Concierge messages often open with a heading line, like "Welcome to Expensify", which makes a good one line title
function getFirstLine(text: string): string {
    return (
        text
            .split('\n')
            .find((line) => !!line.trim())
            ?.trim() ?? ''
    );
}

function getFirstSentence(text: string): string {
    const singleLineText = text.replaceAll(/\s+/g, ' ').trim();
    return singleLineText.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? singleLineText;
}

function ConciergeConversationRowContent({title, lastMessage, isUnread: isConversationUnread, brickRoadIndicator, isSelected, onPress}: ConciergeConversationRowContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const firstLine = getFirstLine(title);
    const lastMessageFirstSentence = getFirstSentence(lastMessage);

    return (
        <PressableWithFeedback
            onPress={onPress}
            accessibilityLabel={firstLine}
            accessibilityState={{selected: isSelected}}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.CONCIERGE_SIDEBAR.CONVERSATION}
            style={({hovered}) => [
                styles.flexRow,
                styles.alignItemsCenter,
                styles.justifyContentBetween,
                styles.sidebarLink,
                styles.sidebarLinkInnerLHN,
                styles.pl3,
                StyleUtils.getBackgroundColorStyle(theme.sidebar),
                isSelected && styles.hoveredComponentBG,
                hovered && !isSelected && styles.highlightBG,
            ]}
        >
            <View style={[styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]}>
                <View style={[styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()]}>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.optionDisplayName,
                            styles.optionDisplayNameCompact,
                            styles.pre,
                            styles.sidebarLinkText,
                            isConversationUnread && styles.sidebarLinkTextBold,
                            styles.flexShrink0,
                            styles.mw100,
                        ]}
                    >
                        {firstLine}
                    </Text>
                    {!!lastMessageFirstSentence && (
                        <Text
                            numberOfLines={1}
                            style={[styles.sidebarLinkText, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.pre, styles.ml2]}
                        >
                            {lastMessageFirstSentence}
                        </Text>
                    )}
                </View>
            </View>
            {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                <Icon
                    src={icons.DotIndicator}
                    fill={theme.danger}
                />
            )}
        </PressableWithFeedback>
    );
}

function ConciergeThreadRow({conversation, isSelected, onOpenThread}: ConciergeConversationRowProps) {
    const reportID = conversation.reportID;
    const threadAttributesSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>) => {
        const threadAttributes = reportID ? attributes?.reports?.[reportID] : undefined;
        return {reportName: threadAttributes?.reportName ?? '', brickRoadStatus: threadAttributes?.brickRoadStatus};
    };
    const [threadAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: threadAttributesSelector});
    const threadSummarySelector = (report: OnyxEntry<Report>) => ({isUnread: isUnread(report, undefined, false, undefined), lastMessageText: report?.lastMessageText ?? ''});
    const [threadSummary] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: threadSummarySelector});

    return (
        <ConciergeConversationRowContent
            title={threadAttributes?.reportName ?? ''}
            lastMessage={threadSummary?.lastMessageText ?? ''}
            isUnread={threadSummary?.isUnread ?? false}
            brickRoadIndicator={threadAttributes?.brickRoadStatus}
            isSelected={isSelected}
            onPress={() => {
                if (!reportID) {
                    return;
                }
                onOpenThread(reportID);
            }}
        />
    );
}

function ConciergeMessageRow({conversation, onOpenMessage}: ConciergeConversationRowProps) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const messageSelector = (reportActions: OnyxEntry<ReportActions>) => (conversation.reportActionID ? reportActions?.[conversation.reportActionID] : undefined);
    const [message] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: messageSelector});

    // A message posted after the user last read the DM stays unread until they open it, which turns it into a thread row
    const isMessageUnreadSelector = (report: OnyxEntry<Report>) => !report?.lastReadTime || conversation.lastActivity > report.lastReadTime;
    const [isMessageUnread = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: isMessageUnreadSelector});

    const messageText = getReportActionMessageText(message);
    const messageTitle = getFirstLine(messageText);

    return (
        <ConciergeConversationRowContent
            title={messageText}
            // A message without a thread has no replies, so the rest of the message after its heading follows the title
            lastMessage={messageText.slice(messageText.indexOf(messageTitle) + messageTitle.length)}
            isUnread={isMessageUnread}
            isSelected={false}
            onPress={() => {
                if (!message) {
                    return;
                }
                onOpenMessage(message);
            }}
        />
    );
}

function ConciergeConversationRow(props: ConciergeConversationRowProps) {
    if (props.conversation.reportID) {
        // eslint-disable-next-line react/jsx-props-no-spreading -- Both rows take the same props
        return <ConciergeThreadRow {...props} />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- Both rows take the same props
    return <ConciergeMessageRow {...props} />;
}

export default ConciergeConversationRow;
