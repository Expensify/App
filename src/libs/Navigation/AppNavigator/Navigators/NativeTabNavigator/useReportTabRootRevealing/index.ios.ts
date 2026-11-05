import TabRootRevealingContext from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/TabRootRevealingContext';
import {isTabRootScreen} from '@libs/Navigation/helpers/isTabRouteAtRoot';

import CONST from '@src/CONST';

import {useContext, useEffect} from 'react';
import {withTiming} from 'react-native-reanimated';

import type UseReportTabRootRevealing from './types';

/**
 * UIKit starts the swipe-back gesture on its own and the navigation state follows only once the gesture ends, so a
 * stack whose root is a tab root reports the root starting to appear. A cancelled gesture is reported by the screen
 * that stays on top, since RNScreens tells the root nothing when it slides back out.
 * The tab bar then comes back with the root screen instead of after it, and the floating buttons, which sit above every
 * screen, show once the root is fully in view.
 */
const useReportTabRootRevealing: UseReportTabRootRevealing = (state, descriptors) => {
    const {setIsRevealing, revealed} = useContext(TabRootRevealingContext);
    const rootRoute = state.routes.at(0);
    const topRoute = state.routes.at(-1);
    const isRootTabRoot = !!rootRoute && isTabRootScreen(rootRoute.name);
    const rootNavigation = isRootTabRoot ? descriptors[rootRoute.key]?.navigation : undefined;
    const topNavigation = isRootTabRoot && topRoute && topRoute.key !== rootRoute.key ? descriptors[topRoute.key]?.navigation : undefined;

    useEffect(() => {
        if (!rootNavigation) {
            return;
        }
        const unsubscribeStart = rootNavigation.addListener('transitionStart', (event) => {
            setIsRevealing(event.data?.closing === false);
            revealed?.set(0);
        });
        const unsubscribeEnd = rootNavigation.addListener('transitionEnd', (event) => {
            if (event.data?.closing !== false) {
                return;
            }
            revealed?.set(withTiming(1, {duration: CONST.MODAL.ANIMATION_TIMING.FAB_IN}));
        });
        return () => {
            unsubscribeStart();
            unsubscribeEnd();
        };
    }, [rootNavigation, setIsRevealing, revealed]);

    useEffect(() => {
        if (!topNavigation) {
            return;
        }
        return topNavigation.addListener('gestureCancel', () => setIsRevealing(false));
    }, [topNavigation, setIsRevealing]);
};

export default useReportTabRootRevealing;
