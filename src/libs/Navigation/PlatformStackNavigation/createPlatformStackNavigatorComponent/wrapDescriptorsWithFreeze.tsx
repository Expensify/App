import type {ParamListBase} from '@react-navigation/native';
import React from 'react';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import ScreenFreezeWrapper from './ScreenFreezeWrapper';

type Descriptor = {
    /** Route object containing the screen name, used to check if the screen is persistent */
    route: {name: string};

    /** Render function for the screen content, wrapped with ScreenFreezeWrapper */
    render: () => React.JSX.Element;
};

/**
 * Wraps each screen's render function with ScreenFreezeWrapper to freeze non-top screens.
 * This prevents off-screen components from re-rendering.
 * Persistent screens (e.g. sidebar on web) are excluded from freezing so they stay interactive.
 */
function wrapDescriptorsWithFreeze<T extends Descriptor>(
    descriptors: Record<string, T>,
    state: PlatformStackNavigationState<ParamListBase>,
    persistentScreens?: string[],
): Record<string, T> {
    const topRouteKey = state.routes[state.index]?.key;
    const result: Record<string, T> = {};
    for (const [key, descriptor] of Object.entries(descriptors)) {
        const isOnTop = key === topRouteKey;
        const isPersistent = persistentScreens?.includes(descriptor.route.name);
        const isScreenBlurred = !isOnTop && !isPersistent;
        result[key] = {
            ...descriptor,
            render: () => <ScreenFreezeWrapper isScreenBlurred={isScreenBlurred}>{descriptor.render()}</ScreenFreezeWrapper>,
        };
    }
    return result;
}

export default wrapDescriptorsWithFreeze;
