import {
    ACTION_WIDTH,
    ACTIVATION_OFFSET,
    ARM_TIMING_CONFIG,
    FAIL_OFFSET_VERTICAL,
    FULL_SWIPE_MIN_OVERSHOOT,
    FULL_SWIPE_ROW_RATIO,
    OPEN_VELOCITY,
    SIDE,
    SPRING_CONFIG,
} from '@components/SwipeableRow/const';
import SwipeableListContext from '@components/SwipeableRow/SwipeableListContext';
import type {SwipeableListRow} from '@components/SwipeableRow/SwipeableListContext';

import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import HapticFeedback from '@libs/HapticFeedback';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';
import {GestureDetector, usePanGesture} from 'react-native-gesture-handler';
import {setNativeProps, useAnimatedReaction, useAnimatedRef, useSharedValue, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import {scheduleOnRN, scheduleOnUI} from 'react-native-worklets';

import type SwipeableListProps from './types';

/**
 * Owns the single swipe gesture of a list. Rows register themselves on touch start; when a horizontal drag activates,
 * the touched row is switched on and follows the finger. Idle rows cost one View and a context read.
 * Only one row is open at a time, like in Mail.
 */
function SwipeableList({children}: SwipeableListProps) {
    const styles = useThemeStyles();
    const isScreenReaderEnabled = Accessibility.useScreenReaderStatus();

    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const listWidth = useSharedValue(0);
    const leadingWidth = useSharedValue(0);
    const trailingWidth = useSharedValue(0);
    const isRowActive = useSharedValue(false);
    const touchedRowKey = useSharedValue('');
    const activeRowKey = useSharedValue('');
    const armedSide = useSharedValue<number>(SIDE.NONE);
    const armedProgress = useSharedValue(0);
    const popScale = useSharedValue(1);

    const activeRowViewRef = useAnimatedRef<View>();
    const touchedRowRef = useRef<SwipeableListRow | undefined>(undefined);
    const activeRowRef = useRef<SwipeableListRow | undefined>(undefined);
    const isActiveRowOpenRef = useRef(false);

    /** Puts the currently attached row back in place before another one takes the offset. */
    const resetAttachedRow = () => {
        'worklet';

        if (!activeRowViewRef()) {
            return;
        }
        setNativeProps(activeRowViewRef, {transform: [{translateX: 0}]});
    };

    const deactivateActiveRow = () => {
        activeRowRef.current?.deactivate();
        activeRowRef.current = undefined;
        isActiveRowOpenRef.current = false;
    };

    /** Springs the active row shut and switches it off once it is closed. */
    const springClosed = () => {
        'worklet';

        translateX.set(
            withSpring(0, SPRING_CONFIG, (isFinished) => {
                // A new swipe interrupts the spring; that swipe now owns the offset
                if (!isFinished) {
                    return;
                }
                resetAttachedRow();
                isRowActive.set(false);
                activeRowKey.set('');
                scheduleOnRN(deactivateActiveRow);
            }),
        );
    };

    const closeActiveRow = () => {
        if (!activeRowRef.current) {
            return;
        }
        isActiveRowOpenRef.current = false;
        activeRowRef.current.setIsOpen(false);
        springClosed();
    };

    const registerTouch = (row: SwipeableListRow) => {
        touchedRowRef.current = row;
        touchedRowKey.set(row.key);
    };

    // Runs before any row's onTouchStart, so a touch outside swipeable rows never swipes the last touched one
    const clearTouchedRow = () => {
        touchedRowRef.current = undefined;
        touchedRowKey.set('');
    };

    // Runs after the rows' onTouchStart: touching anything but the open row (another row, or scrolling) closes it
    const closeOpenRowOnOutsideTouch = () => {
        if (!isActiveRowOpenRef.current || touchedRowRef.current?.key === activeRowRef.current?.key) {
            return;
        }
        closeActiveRow();
    };

    const activateTouchedRow = () => {
        const row = touchedRowRef.current;
        if (!row) {
            return;
        }
        if (activeRowRef.current?.key === row.key) {
            // Still attached (open, or its spring back was interrupted): keep moving it
            activeRowRef.current = row;
            isRowActive.set(true);
            return;
        }
        // One offset is shared by the whole list, so the previous row snaps shut before the touched one moves
        if (activeRowRef.current) {
            scheduleOnUI(resetAttachedRow);
        }
        deactivateActiveRow();
        translateX.set(0);
        startX.set(0);
        leadingWidth.set(row.leadingActionCount * ACTION_WIDTH);
        trailingWidth.set(row.trailingActionCount * ACTION_WIDTH);
        activeRowRef.current = row;
        activeRowKey.set(row.key);
        // The row re-renders with attachActiveRow, which switches the swipe on once its view is attached
        row.activate();
    };

    const attachActiveRow = (view: View | null) => {
        activeRowViewRef(view);
        if (!view) {
            return;
        }
        isRowActive.set(true);
    };

    const markActiveRowOpen = () => {
        isActiveRowOpenRef.current = true;
        activeRowRef.current?.setIsOpen(true);
    };

    const runPrimaryAction = (side: number) => {
        activeRowRef.current?.runPrimaryAction(side);
    };

    const panGesture = usePanGesture({
        activeOffsetX: [-ACTIVATION_OFFSET, ACTIVATION_OFFSET],
        failOffsetY: [-FAIL_OFFSET_VERTICAL, FAIL_OFFSET_VERTICAL],
        onActivate: () => {
            const isSameRow = isRowActive.get() && touchedRowKey.get() !== '' && touchedRowKey.get() === activeRowKey.get();
            if (isSameRow) {
                // Dragging the open row again continues from where it rests
                startX.set(translateX.get());
            } else {
                // Another row was touched; nothing moves until it is switched on from JS
                isRowActive.set(false);
            }
            scheduleOnRN(activateTouchedRow);
        },
        onUpdate: (event) => {
            if (!isRowActive.get()) {
                return;
            }
            let x = startX.get() + event.translationX;
            if (leadingWidth.get() === 0) {
                x = Math.min(x, 0);
            }
            if (trailingWidth.get() === 0) {
                x = Math.max(x, 0);
            }
            translateX.set(x);

            const fullSwipeRatioDistance = listWidth.get() * FULL_SWIPE_ROW_RATIO;
            let side: number = SIDE.NONE;
            if (leadingWidth.get() > 0 && x >= Math.max(leadingWidth.get() + FULL_SWIPE_MIN_OVERSHOOT, fullSwipeRatioDistance)) {
                side = SIDE.LEADING;
            } else if (trailingWidth.get() > 0 && -x >= Math.max(trailingWidth.get() + FULL_SWIPE_MIN_OVERSHOOT, fullSwipeRatioDistance)) {
                side = SIDE.TRAILING;
            }
            if (side === armedSide.get()) {
                return;
            }
            armedSide.set(side);
            armedProgress.set(withTiming(side === SIDE.NONE ? 0 : 1, ARM_TIMING_CONFIG));
            if (side !== SIDE.NONE) {
                popScale.set(withSequence(withTiming(1.25, {duration: 90}), withSpring(1, {damping: 10, stiffness: 300})));
                scheduleOnRN(HapticFeedback.press);
            }
        },
        onDeactivate: (event) => {
            const side = armedSide.get();
            armedSide.set(SIDE.NONE);
            armedProgress.set(withTiming(0, ARM_TIMING_CONFIG));
            if (!isRowActive.get()) {
                return;
            }

            if (!event.canceled && side !== SIDE.NONE) {
                springClosed();
                scheduleOnRN(runPrimaryAction, side);
                return;
            }

            const x = translateX.get();
            const leading = leadingWidth.get();
            const trailing = trailingWidth.get();
            if (leading > 0 && x > 0 && (x > leading / 2 || event.velocityX > OPEN_VELOCITY)) {
                translateX.set(withSpring(leading, SPRING_CONFIG));
                scheduleOnRN(markActiveRowOpen);
                return;
            }
            if (trailing > 0 && x < 0 && (-x > trailing / 2 || event.velocityX < -OPEN_VELOCITY)) {
                translateX.set(withSpring(-trailing, SPRING_CONFIG));
                scheduleOnRN(markActiveRowOpen);
                return;
            }
            springClosed();
        },
    });

    // Moves only the attached row; every other row stays a plain, unanimated View
    useAnimatedReaction(
        () => translateX.get(),
        (x) => {
            if (!isRowActive.get() || !activeRowViewRef()) {
                return;
            }
            setNativeProps(activeRowViewRef, {transform: [{translateX: x}]});
        },
    );

    const onLayout = (event: LayoutChangeEvent) => {
        listWidth.set(event.nativeEvent.layout.width);
    };

    return (
        <SwipeableListContext.Provider value={{isScreenReaderEnabled, registerTouch, closeActiveRow, attachActiveRow, translateX, armedProgress, popScale}}>
            <GestureDetector gesture={panGesture}>
                <View
                    style={styles.flex1}
                    onLayout={onLayout}
                    onTouchStartCapture={clearTouchedRow}
                    onTouchStart={closeOpenRowOnOutsideTouch}
                    collapsable={false}
                >
                    {children}
                </View>
            </GestureDetector>
        </SwipeableListContext.Provider>
    );
}

function SwipeableListDisabled({children}: SwipeableListProps) {
    return children;
}

// Picked once at load, so the POC switch adds no component layer to every row
/** With the POC switch off, the list renders exactly as without swipe actions. */
export default CONST.IS_INBOX_SWIPE_LIST_ENABLED ? SwipeableList : SwipeableListDisabled;
