import {easing} from '@components/Modal/ReanimatedModal/utils';

import Accessibility from '@libs/Accessibility';
import {finishHomeTodoReportTransition, homeTodoPanelOpacity, homeTodoPanelTranslateX, registerHomeTodoReportTransition, resetHomeTodoReportTransition} from '@libs/HomeTodoReportTransition';

import CONST from '@src/CONST';

import {useEffect, useEffectEvent, useRef} from 'react';
import {withDelay, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

const {PANEL_OFFSET, EXIT_DURATION, ENTER_DURATION, ENTER_FALLBACK_DELAY} = CONST.HOME_TODO_REVIEW_ANIMATION;

/**
 * Lets a Home to-do review swap the report on this screen with the RHP panel transition. The panel moves in once the
 * screen renders the next report. With reduce motion on, the panel only fades.
 */
function useHomeTodoReportTransition(routeKey: string, reportID: string | undefined) {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const offset = isReduceMotionEnabled ? 0 : PANEL_OFFSET;
    const isEnterPendingRef = useRef(false);
    const enterFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const playEnter = useEffectEvent(() => {
        isEnterPendingRef.current = false;
        clearTimeout(enterFallbackTimeoutRef.current);
        homeTodoPanelTranslateX.set(withTiming(0, {duration: ENTER_DURATION, easing}));
        homeTodoPanelOpacity.set(
            withTiming(1, {duration: ENTER_DURATION, easing}, (finished) => {
                // A next swap cancels this one, and it now owns the panel.
                if (!finished) {
                    return;
                }
                scheduleOnRN(finishHomeTodoReportTransition, routeKey);
            }),
        );
    });

    useEffect(() => {
        const unregister = registerHomeTodoReportTransition(routeKey, {
            playExit: (onFinished, delay) => {
                homeTodoPanelTranslateX.set(withDelay(delay, withTiming(-offset, {duration: EXIT_DURATION, easing})));
                // The next report is shown even when the exit is interrupted, so the review never stalls.
                homeTodoPanelOpacity.set(
                    withDelay(
                        delay,
                        withTiming(0, {duration: EXIT_DURATION, easing}, () => scheduleOnRN(onFinished)),
                    ),
                );
            },
            prepareEnter: () => {
                isEnterPendingRef.current = true;
                homeTodoPanelTranslateX.set(offset);
                enterFallbackTimeoutRef.current = setTimeout(() => playEnter(), ENTER_FALLBACK_DELAY);
            },
        });
        return () => {
            unregister();
            clearTimeout(enterFallbackTimeoutRef.current);
            // The panel is shared by every RHP screen, so it must not stay hidden when this screen goes away mid-swap.
            resetHomeTodoReportTransition(routeKey);
        };
    }, [routeKey, offset]);

    useEffect(() => {
        if (!isEnterPendingRef.current) {
            return;
        }
        playEnter();
    }, [reportID]);
}

export default useHomeTodoReportTransition;
