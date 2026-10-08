import SwipeActionIndicator from '@components/SwipeableRow/SwipeActionIndicator';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import {getReportActionMessage, isMessageDeleted} from '@libs/ReportActionsUtils';
import {shouldDisableThread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import type {SharedValue} from 'react-native-reanimated';

import React, {useContext, useState} from 'react';
import {View} from 'react-native';
import {Extrapolation, interpolate, useAnimatedStyle} from 'react-native-reanimated';

import type SwipeToReplyProps from './types';

import {INDICATOR_SLIDE_DISTANCE, THRESHOLD} from './const';
import ReplyInThreadContext from './ReplyInThreadContext';

/** Content that already pans horizontally inside the message (scrollable tables, interactive charts) would fight the swipe. */
const HORIZONTAL_GESTURE_TAGS = ['<table', '<victorychart'];

function canSwipeToReply(action: ReportAction): boolean {
    if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT || action.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID) {
        return false;
    }
    if (action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isMessageDeleted(action)) {
        return false;
    }
    const html = getReportActionMessage(action)?.html ?? '';
    return !HORIZONTAL_GESTURE_TAGS.some((tag) => html.includes(tag));
}

type IndicatorProps = {
    translateX: SharedValue<number>;
    armedProgress: SharedValue<number>;
    popScale: SharedValue<number>;
};

/** The reply icon behind the message. Mounted only on the message being swiped. */
function Indicator({translateX, armedProgress, popScale}: IndicatorProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleReply']);

    const indicatorStyle = useAnimatedStyle(() => {
        const progress = interpolate(-translateX.get(), [0, THRESHOLD], [0, 1], Extrapolation.CLAMP);
        return {
            opacity: progress,
            transform: [{translateX: (1 - progress) * INDICATOR_SLIDE_DISTANCE}, {scale: (0.5 + 0.5 * progress) * popScale.get()}],
        };
    });

    return (
        <View
            style={styles.swipeToReplyIndicatorContainer}
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
        >
            <SwipeActionIndicator
                icon={icons.ChatBubbleReply}
                armedProgress={armedProgress}
                style={indicatorStyle}
            />
        </View>
    );
}

/**
 * Swipe a chat message left to open its thread ("Reply in thread"), Telegram-style.
 * The gesture lives in ReplyInThreadProvider, one per chat; a message only reports that it was touched and, while it
 * is being swiped, borrows the chat's offset. Leftward only: rightward swipes on the report screen mean "go back".
 */
function SwipeToReply({action, isThreadReportParentAction, isDisabled, children}: SwipeToReplyProps) {
    const replyInThreadContext = useContext(ReplyInThreadContext);
    const [isActive, setIsActive] = useState(false);

    // FlashList recycles cells, so a cell reused for another message must not keep the swipe
    const [prevReportActionID, setPrevReportActionID] = useState(action.reportActionID);
    if (prevReportActionID !== action.reportActionID) {
        setPrevReportActionID(action.reportActionID);
        setIsActive(false);
    }

    const isEnabled = !isDisabled && !!replyInThreadContext && canSwipeToReply(action) && !shouldDisableThread(action, isThreadReportParentAction, replyInThreadContext.isReportArchived);

    const registerTouch = () => {
        replyInThreadContext?.registerTouch({
            action,
            activate: () => setIsActive(true),
            deactivate: () => setIsActive(false),
        });
    };

    return (
        <View onTouchStart={isEnabled ? registerTouch : undefined}>
            {isActive && !!replyInThreadContext && (
                <Indicator
                    translateX={replyInThreadContext.translateX}
                    armedProgress={replyInThreadContext.armedProgress}
                    popScale={replyInThreadContext.popScale}
                />
            )}
            <View ref={isActive ? replyInThreadContext?.attachActiveRow : undefined}>{children}</View>
        </View>
    );
}

function SwipeToReplyDisabled({children}: SwipeToReplyProps) {
    return children;
}

// Picked once at load, so the POC switch adds no component layer to every row
/** With the POC switch off, messages render exactly as without swipe-to-reply. */
export default CONST.IS_CHAT_SWIPE_TO_REPLY_ENABLED ? SwipeToReply : SwipeToReplyDisabled;
