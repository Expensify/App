/** The rows of the Concierge page list, styled like an Inbox chat row in focus mode, without the avatar: the title, then the latest message as far as it fits. Each row reads its own data, so a change to one conversation only redraws that row. */
import OptionRow from '@components/LHNOptionsList/OptionRowLHN/OptionRow';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useOnyx from '@hooks/useOnyx';
import {useReportAttributesByID} from '@hooks/useReportAttributes';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isUnreadConciergeMessage} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportActionMessageText} from '@libs/ReportActionsUtils';
import {isUnread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {getReportLastReadTime} from '@selectors/Report';
import React from 'react';
import {View} from 'react-native';

type ConciergeConversationPressableProps = {
    /** Read out for the row */
    accessibilityLabel: string;

    /** The open report is this conversation or a thread nested in it */
    isSelected: boolean;

    onPress: () => void;

    children: ReactNode;
};

type ConciergeConversationTextProps = {
    title: string;

    /** The most recent message, whose first sentence follows the title as far as it fits */
    lastMessage: string;

    isUnread: boolean;
};

type ConciergeThreadRowProps = {
    /** The thread of the Concierge DM the row shows */
    reportID: string;

    /** The open report is this thread or a thread nested in it */
    isSelected: boolean;

    onPress: (reportID: string) => void;
};

type ConciergeMessageRowProps = {
    /** The Concierge message without a thread that the row shows */
    reportActionID: string;

    onPress: (message: ReportAction) => void;
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

function getThreadSummary(report: OnyxEntry<Report>) {
    return {isUnread: isUnread(report, undefined, false, undefined), lastMessageText: report?.lastMessageText ?? ''};
}

function ConciergeConversationPressable({accessibilityLabel, isSelected, onPress, children}: ConciergeConversationPressableProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    return (
        <PressableWithFeedback
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
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
            {children}
        </PressableWithFeedback>
    );
}

function ConciergeConversationText({title, lastMessage, isUnread: isConversationUnread}: ConciergeConversationTextProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const lastMessageFirstSentence = getFirstSentence(lastMessage);

    return (
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
                    {title}
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
    );
}

function ConciergeThreadRow({reportID, isSelected, onPress}: ConciergeThreadRowProps) {
    const threadAttributes = useReportAttributesByID(reportID);
    const [threadSummary] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getThreadSummary});
    const title = getFirstLine(threadAttributes?.reportName ?? '');

    return (
        <ConciergeConversationPressable
            accessibilityLabel={title}
            isSelected={isSelected}
            onPress={() => onPress(reportID)}
        >
            <ConciergeConversationText
                title={title}
                lastMessage={threadSummary?.lastMessageText ?? ''}
                isUnread={threadSummary?.isUnread ?? false}
            />
            <OptionRow.ErrorBadge
                brickRoadIndicator={threadAttributes?.brickRoadStatus}
                actionBadge={undefined}
            />
        </ConciergeConversationPressable>
    );
}

function ConciergeMessageRow({reportActionID, onPress}: ConciergeMessageRowProps) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const messageSelector = (reportActions: OnyxEntry<ReportActions>) => reportActions?.[reportActionID];
    const [message] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: messageSelector});

    const [conciergeLastReadTime] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: getReportLastReadTime});
    const isMessageUnread = isUnreadConciergeMessage(message, conciergeLastReadTime);

    const messageText = getReportActionMessageText(message);
    const title = getFirstLine(messageText);

    return (
        <ConciergeConversationPressable
            accessibilityLabel={title}
            isSelected={false}
            onPress={() => {
                if (!message) {
                    return;
                }
                onPress(message);
            }}
        >
            <ConciergeConversationText
                title={title}
                // A message without a thread has no replies, so the rest of the message after its heading follows the title
                lastMessage={messageText.slice(messageText.indexOf(title) + title.length)}
                isUnread={isMessageUnread}
            />
        </ConciergeConversationPressable>
    );
}

export {ConciergeMessageRow, ConciergeThreadRow};
