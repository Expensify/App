import SetTabRootRevealingContext from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/SetTabRootRevealingContext';
import {isTabRootScreen} from '@libs/Navigation/helpers/isTabRouteAtRoot';

import {useContext, useEffect} from 'react';

import type UseReportTabRootRevealing from './types';

/**
 * UIKit starts the swipe-back gesture on its own and the navigation state follows only once the gesture ends, so a
 * stack whose root is a tab root reports the root starting to appear. A cancelled gesture is reported by the screen
 * that stays on top, since RNScreens tells the root nothing when it slides back out.
 * The tab bar then comes back with the root screen instead of after it.
 */
const useReportTabRootRevealing: UseReportTabRootRevealing = (state, descriptors) => {
    const setIsTabRootRevealing = useContext(SetTabRootRevealingContext);
    const rootRoute = state.routes.at(0);
    const topRoute = state.routes.at(-1);
    const isRootTabRoot = !!rootRoute && isTabRootScreen(rootRoute.name);
    const rootNavigation = isRootTabRoot ? descriptors[rootRoute.key]?.navigation : undefined;
    const topNavigation = isRootTabRoot && topRoute && topRoute.key !== rootRoute.key ? descriptors[topRoute.key]?.navigation : undefined;

    useEffect(() => {
        if (!rootNavigation) {
            return;
        }
        return rootNavigation.addListener('transitionStart', (event) => setIsTabRootRevealing(event.data?.closing === false));
    }, [rootNavigation, setIsTabRootRevealing]);

    useEffect(() => {
        if (!topNavigation) {
            return;
        }
        return topNavigation.addListener('gestureCancel', () => setIsTabRootRevealing(false));
    }, [topNavigation, setIsTabRootRevealing]);
};

export default useReportTabRootRevealing;
