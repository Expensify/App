import {easing} from '@components/Modal/ReanimatedModal/utils';

import Accessibility from '@libs/Accessibility';
import {homeTodoPanelOpacity, homeTodoPanelTranslateX, registerHomeTodoReportTransition} from '@libs/HomeTodoReportTransition';

import {useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {withDelay, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

/** How far the panel moves while it fades, a short slide so it reads as the same panel leaving and coming back */
const PANEL_OFFSET = 24;
const EXIT_DURATION = 150;
const ENTER_DURATION = 250;

/** Shows the panel again even if the screen never renders a new report ID, so it cannot stay out of view */
const ENTER_FALLBACK_DELAY = 1000;

/**
 * Lets a Home to-do review swap the report on this screen with the RHP panel transition. The panel moves in once the
 * screen renders the next report. With reduce motion on, the panel only fades.
 */
function useHomeTodoReportTransition(reportID: string | undefined) {
    const route = useRoute();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const offset = isReduceMotionEnabled ? 0 : PANEL_OFFSET;
    const isEnterPendingRef = useRef(false);
    const enterFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const playEnter = () => {
        isEnterPendingRef.current = false;
        clearTimeout(enterFallbackTimeoutRef.current);
        homeTodoPanelTranslateX.set(withTiming(0, {duration: ENTER_DURATION, easing}));
        homeTodoPanelOpacity.set(withTiming(1, {duration: ENTER_DURATION, easing}));
    };

    useEffect(() => {
        const unregister = registerHomeTodoReportTransition(route.key, {
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
                enterFallbackTimeoutRef.current = setTimeout(playEnter, ENTER_FALLBACK_DELAY);
            },
        });
        return () => {
            unregister();
            clearTimeout(enterFallbackTimeoutRef.current);
            // The panel is shared by every RHP screen, so it must not stay hidden when this screen goes away mid-swap.
            homeTodoPanelOpacity.set(1);
            homeTodoPanelTranslateX.set(0);
        };
        // playEnter only reads refs and shared values, so the handler only changes with the screen and the offset.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.key, offset]);

    useEffect(() => {
        if (!isEnterPendingRef.current) {
            return;
        }
        playEnter();
        // Only a new report on screen starts the enter animation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);
}

export default useHomeTodoReportTransition;
