import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {getChildReport, navigateToAndOpenChildReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import HapticFeedback from '@libs/HapticFeedback';
import {getParticipantsPersonalDetails} from '@libs/PersonalDetailsUtils';

import {ACTIVATION_OFFSET, ARM_TIMING_CONFIG, FAIL_OFFSET_RIGHT, FAIL_OFFSET_VERTICAL, MAX_OVERSHOOT, SPRING_BACK_CONFIG, THRESHOLD} from '@pages/inbox/report/SwipeToReply/const';
import ReplyInThreadContext from '@pages/inbox/report/SwipeToReply/ReplyInThreadContext';
import type {SwipeToReplyRow} from '@pages/inbox/report/SwipeToReply/ReplyInThreadContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {GestureDetector, usePanGesture} from 'react-native-gesture-handler';
import {setNativeProps, useAnimatedReaction, useAnimatedRef, useSharedValue, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import {scheduleOnRN, scheduleOnUI} from 'react-native-worklets';

import type ReplyInThreadProviderProps from './types';

/** Follows the finger 1:1 up to the threshold, then rubber-bands towards THRESHOLD + MAX_OVERSHOOT. */
function rubberBand(distance: number): number {
    'worklet';

    if (distance <= THRESHOLD) {
        return distance;
    }
    const overshoot = distance - THRESHOLD;
    return THRESHOLD + (overshoot * MAX_OVERSHOOT) / (overshoot + MAX_OVERSHOOT);
}

/**
 * Owns the single swipe-to-reply gesture of a chat. Messages register themselves on touch start; when a leftward drag
 * activates, the touched message is switched on and follows the finger. Idle messages cost one View and a context read.
 */
function ReplyInThreadProvider({report, isReportArchived, children}: ReplyInThreadProviderProps) {
    const styles = useThemeStyles();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [personalDetails] = useAllPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`);

    const translateX = useSharedValue(0);
    const isRowActive = useSharedValue(false);
    const isArmed = useSharedValue(false);
    const armedProgress = useSharedValue(0);
    const popScale = useSharedValue(1);

    const activeRowViewRef = useAnimatedRef<View>();
    const touchedRowRef = useRef<SwipeToReplyRow | undefined>(undefined);
    const activeRowRef = useRef<SwipeToReplyRow | undefined>(undefined);

    // The latest values are kept in a ref so the context value stays stable: a new Concierge message must not
    // re-render every message in the chat
    const latestRef = useRef({report, currentUserAccountID, personalDetails, introSelected, isSelfTourViewed, conciergeChat});
    useEffect(() => {
        latestRef.current = {report, currentUserAccountID, personalDetails, introSelected, isSelfTourViewed, conciergeChat};
    });

    const replyInThread = (action: ReportAction) => {
        const latest = latestRef.current;
        const participantsPersonalDetails = getParticipantsPersonalDetails([latest.currentUserAccountID, Number(action.actorAccountID)], latest.personalDetails);
        KeyboardUtils.dismiss().then(() => {
            navigateToAndOpenChildReport(
                getChildReport(action),
                action,
                latest.report,
                latest.currentUserAccountID,
                latest.introSelected,
                participantsPersonalDetails,
                latest.isSelfTourViewed,
                latest.conciergeChat,
            );
        });
    };

    const registerTouch = (row: SwipeToReplyRow) => {
        touchedRowRef.current = row;
    };

    // Runs before any message's onTouchStart, so a touch outside swipeable messages never swipes the last touched one
    const clearTouchedRow = () => {
        touchedRowRef.current = undefined;
    };

    /** Puts the currently attached message back in place before another one takes the offset. */
    const resetAttachedRow = () => {
        'worklet';

        if (!activeRowViewRef()) {
            return;
        }
        setNativeProps(activeRowViewRef, {transform: [{translateX: 0}]});
    };

    const activateTouchedRow = () => {
        const row = touchedRowRef.current;
        if (!row) {
            return;
        }
        const activeRow = activeRowRef.current;
        if (activeRow?.action.reportActionID === row.action.reportActionID) {
            // Still attached from the previous swipe (its spring back was interrupted)
            activeRowRef.current = row;
            isRowActive.set(true);
            return;
        }
        if (activeRow) {
            scheduleOnUI(resetAttachedRow);
            activeRow.deactivate();
        }
        activeRowRef.current = row;
        // The message re-renders with attachActiveRow, which switches the swipe on once its view is attached
        row.activate();
    };

    const attachActiveRow = (view: View | null) => {
        activeRowViewRef(view);
        if (!view) {
            return;
        }
        isRowActive.set(true);
    };

    const deactivateRow = () => {
        activeRowRef.current?.deactivate();
        activeRowRef.current = undefined;
    };

    const openActiveRowThread = () => {
        const row = activeRowRef.current;
        if (!row) {
            return;
        }
        replyInThread(row.action);
    };

    const panGesture = usePanGesture({
        activeOffsetX: ACTIVATION_OFFSET,
        failOffsetX: FAIL_OFFSET_RIGHT,
        failOffsetY: [-FAIL_OFFSET_VERTICAL, FAIL_OFFSET_VERTICAL],
        onActivate: () => {
            // Nothing moves until JS confirms which message this swipe belongs to
            isRowActive.set(false);
            scheduleOnRN(activateTouchedRow);
        },
        onUpdate: (event) => {
            // The touched message is switched on from JS; until then (or when it can't be swiped) nothing moves
            if (!isRowActive.get()) {
                return;
            }
            const distance = Math.max(0, -event.translationX);
            translateX.set(-rubberBand(distance));

            const shouldBeArmed = distance >= THRESHOLD;
            if (shouldBeArmed === isArmed.get()) {
                return;
            }
            isArmed.set(shouldBeArmed);
            armedProgress.set(withTiming(shouldBeArmed ? 1 : 0, ARM_TIMING_CONFIG));
            if (shouldBeArmed) {
                popScale.set(withSequence(withTiming(1.25, {duration: 90}), withSpring(1, {damping: 10, stiffness: 300})));
                scheduleOnRN(HapticFeedback.press);
            }
        },
        onDeactivate: (event) => {
            if (event.canceled || !isRowActive.get() || !isArmed.get()) {
                return;
            }
            scheduleOnRN(openActiveRowThread);
        },
        onFinalize: () => {
            isArmed.set(false);
            armedProgress.set(withTiming(0, ARM_TIMING_CONFIG));
            if (!isRowActive.get()) {
                return;
            }
            translateX.set(
                withSpring(0, SPRING_BACK_CONFIG, (isFinished) => {
                    // A new swipe interrupts the spring; that swipe now owns the offset
                    if (!isFinished) {
                        return;
                    }
                    resetAttachedRow();
                    isRowActive.set(false);
                    scheduleOnRN(deactivateRow);
                }),
            );
        },
    });

    // Moves only the attached message; every other message stays a plain, unanimated View
    useAnimatedReaction(
        () => translateX.get(),
        (x) => {
            if (!isRowActive.get() || !activeRowViewRef()) {
                return;
            }
            setNativeProps(activeRowViewRef, {transform: [{translateX: x}]});
        },
    );

    return (
        <ReplyInThreadContext.Provider value={{isReportArchived, registerTouch, attachActiveRow, translateX, armedProgress, popScale}}>
            <GestureDetector gesture={panGesture}>
                <View
                    style={styles.flex1}
                    onTouchStartCapture={clearTouchedRow}
                    collapsable={false}
                >
                    {children}
                </View>
            </GestureDetector>
        </ReplyInThreadContext.Provider>
    );
}

function ReplyInThreadProviderDisabled({children}: ReplyInThreadProviderProps) {
    return children;
}

// Picked once at load, so the POC switch adds no component layer to every row
/** With the POC switch off, the chat reads none of the swipe-to-reply data. */
export default CONST.IS_CHAT_SWIPE_TO_REPLY_ENABLED ? ReplyInThreadProvider : ReplyInThreadProviderDisabled;
