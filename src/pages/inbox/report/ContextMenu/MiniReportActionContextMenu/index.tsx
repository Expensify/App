import React, {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import BaseReportActionContextMenu from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useMiniContextMenuActions, useMiniContextMenuState} from '@pages/inbox/report/ContextMenu/MiniContextMenuProvider';

const SLIDE_DURATION = 200;
const OVERSHOOT_EASING = Easing.bezier(0.34, 1.56, 0.64, 1);

function MiniReportActionContextMenu() {
    const state = useMiniContextMenuState();
    const {hideMiniContextMenu, cancelHide} = useMiniContextMenuActions();

    const isVisible = state?.isVisible ?? false;
    const wasVisibleRef = useRef(false);

    const baseTop = useSharedValue(0);
    const baseRight = useSharedValue(0);

    useEffect(() => {
        if (!state) {
            return;
        }

        if (state.isVisible) {
            const targetY = state.rowMeasurements.top + (state.displayAsGroup ? -8 : -4);
            const targetRight = window.innerWidth - state.rowMeasurements.right + 4;

            if (wasVisibleRef.current) {
                baseTop.set(withTiming(targetY, {duration: SLIDE_DURATION, easing: OVERSHOOT_EASING}));
                baseRight.set(withTiming(targetRight, {duration: SLIDE_DURATION}));
            } else {
                baseTop.set(targetY);
                baseRight.set(targetRight);
            }
        }
        wasVisibleRef.current = state.isVisible;
    });

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const handleScroll = () => {
            hideMiniContextMenu();
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isVisible, hideMiniContextMenu]);

    const positionStyle = useAnimatedStyle(() => ({
        top: baseTop.get(),
        right: baseRight.get(),
    }));

    if (!state) {
        return null;
    }

    return createPortal(
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <div
            onMouseEnter={cancelHide}
            onMouseLeave={hideMiniContextMenu}
            data-selection-scraper-hidden-element={isVisible}
            style={{
                position: 'fixed',
                zIndex: 8,
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                cursor: 'default',
                userSelect: 'none',
                transitionProperty: 'opacity',
                transitionDuration: '150ms',
                transitionTimingFunction: 'ease-in-out',
            }}
        >
            <Animated.View style={[{position: 'absolute'}, positionStyle]}>
                <BaseReportActionContextMenu
                    isMini
                    reportID={state.reportID}
                    reportActionID={state.reportActionID}
                    originalReportID={state.originalReportID}
                    anchor={state.anchor}
                    isArchivedRoom={state.isArchivedRoom}
                    isThreadReportParentAction={state.isThreadReportParentAction}
                    draftMessage={state.draftMessage}
                    isChronosReport={state.isChronosReport}
                    disabledActionIds={state.disabledActionIds}
                    checkIfContextMenuActive={state.checkIfContextMenuActive}
                    setIsEmojiPickerActive={state.setIsEmojiPickerActive}
                    isVisible={state.isVisible}
                />
            </Animated.View>
        </div>,
        document.body,
    );
}

export default MiniReportActionContextMenu;
