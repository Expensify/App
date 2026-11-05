import TabRootRevealingContext from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/TabRootRevealingContext';
import {isAtTabRootLevel} from '@libs/Navigation/helpers/isTabRouteAtRoot';

import {useContext, useEffect} from 'react';

import type UseReportTabRootRevealing from './types';

/**
 * UIKit starts the swipe-back gesture on its own and the navigation state follows only once the gesture ends, so a
 * stack whose root is a tab root reports the root starting to appear, and the tab bar comes back with the root screen
 * instead of after it. A cancelled gesture is reported by the screen that stays on top, since RNScreens tells the root
 * nothing when it slides back out.
 */
const useReportTabRootRevealing: UseReportTabRootRevealing = (state, descriptors) => {
    const setIsRevealing = useContext(TabRootRevealingContext);
    const rootRoute = state.routes.at(0);
    const topRoute = state.routes.at(-1);
    const isRootTabRoot = !!rootRoute && isAtTabRootLevel(rootRoute.name);
    const rootNavigation = isRootTabRoot ? descriptors[rootRoute.key]?.navigation : undefined;
    const topNavigation = isRootTabRoot && topRoute && topRoute.key !== rootRoute.key ? descriptors[topRoute.key]?.navigation : undefined;

    useEffect(() => {
        if (!rootNavigation) {
            return;
        }
        return rootNavigation.addListener('transitionStart', (event) => {
            if (event.data?.closing !== false) {
                return;
            }
            setIsRevealing(true);
        });
    }, [rootNavigation, setIsRevealing]);

    useEffect(() => {
        if (!topNavigation) {
            return;
        }
        return topNavigation.addListener('gestureCancel', () => setIsRevealing(false));
    }, [topNavigation, setIsRevealing]);
};

export default useReportTabRootRevealing;
