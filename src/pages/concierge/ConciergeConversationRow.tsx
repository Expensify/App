/** A row of the Concierge page list. Each row reads its own data, so a change to one conversation only redraws that row. */
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ConciergeConversation} from '@libs/ConciergeConversationUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportActionMessageText} from '@libs/ReportActionsUtils';
import {isUnread} from '@libs/ReportUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, ReportNameValuePairs} from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {getAgentZeroProcessingLabel} from '@selectors/ReportNameValuePairs';
import React, {useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';

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
    isUnread: boolean;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    isSelected: boolean;
    isProcessing?: boolean;

    onPress: () => void;
};

const PULSE_DURATION_MS = 700;
const PULSE_MIN_OPACITY = 0.3;

const conciergeProcessingSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => !!getAgentZeroProcessingLabel(reportNameValuePairs, CONST.ACCOUNT_ID.CONCIERGE);

// Concierge messages often open with a heading line, like "Welcome to Expensify", which makes a good one line title
function getFirstLine(text: string): string {
    return (
        text
            .split('\n')
            .find((line) => !!line.trim())
            ?.trim() ?? ''
    );
}

function ConciergeConversationRowContent({title, isUnread: isConversationUnread, brickRoadIndicator, isSelected, isProcessing = false, onPress}: ConciergeConversationRowContentProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'DotIndicatorUnfilled']);
    const firstLine = getFirstLine(title);
    const isReducedMotionEnabled = useReducedMotion();
    const pulseOpacity = useSharedValue(1);

    useEffect(() => {
        if (!isProcessing || isReducedMotionEnabled) {
            pulseOpacity.set(1);
            return;
        }
        pulseOpacity.set(withRepeat(withTiming(PULSE_MIN_OPACITY, {duration: PULSE_DURATION_MS, easing: Easing.inOut(Easing.ease)}), -1, true));
    }, [isProcessing, isReducedMotionEnabled, pulseOpacity]);

    const pulseStyle = useAnimatedStyle(() => ({opacity: pulseOpacity.get()}));

    return (
        <PressableWithFeedback
            onPress={onPress}
            accessibilityLabel={firstLine}
            accessibilityState={{selected: isSelected}}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.CONCIERGE_SIDEBAR.CONVERSATION}
            style={({hovered}) => [styles.flatNavigationBarItem, styles.mh0, isSelected && styles.hoveredComponentBG, hovered && !isSelected && styles.highlightBG]}
        >
            {({hovered}) => (
                <>
                    <Animated.View style={pulseStyle}>
                        <Icon
                            src={isConversationUnread || isProcessing ? icons.DotIndicator : icons.DotIndicatorUnfilled}
                            fill={isConversationUnread ? theme.success : theme.icon}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                        />
                    </Animated.View>
                    <Text
                        variant={isSelected ? 'textStrong' : 'text'}
                        color={isSelected || hovered ? theme.text : theme.textSupporting}
                        numberOfLines={1}
                        style={styles.flex1}
                    >
                        {firstLine}
                    </Text>
                    {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                        <Icon
                            src={icons.DotIndicator}
                            fill={theme.danger}
                        />
                    )}
                </>
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
    const isThreadUnreadSelector = (report: OnyxEntry<Report>) => isUnread(report, undefined, false, undefined);
    const [isThreadUnread = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: isThreadUnreadSelector});
    const [isProcessing = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`, {selector: conciergeProcessingSelector});

    return (
        <ConciergeConversationRowContent
            title={threadAttributes?.reportName ?? ''}
            isUnread={isThreadUnread}
            isProcessing={isProcessing}
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

    return (
        <ConciergeConversationRowContent
            title={getReportActionMessageText(message)}
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
