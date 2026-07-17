import type {NonTopScreensBehavior, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';
import type {ComponentType, ReactNode} from 'react';

import React from 'react';

import ScreenActivityWrapper from './ScreenActivityWrapper';
import ScreenFreezeWrapper from './ScreenFreezeWrapper';

type Descriptor = {
    /** Route object containing the screen name, used to check if the screen is persistent */
    route: {name: string};

    /** Render function for the screen content, wrapped with the non-top screen wrapper */
    render: () => React.JSX.Element;
};

type NonTopScreenWrapperProps = {
    isScreenBlurred: boolean;
    routeKey: string;
    routeName: string;
    children: ReactNode;
};

const WRAPPER_FOR_BEHAVIOR: Record<NonTopScreensBehavior, ComponentType<NonTopScreenWrapperProps>> = {
    freeze: ScreenFreezeWrapper,
    activity: ScreenActivityWrapper,
};

/**
 * Wraps each screen's render function so that non-top screens either freeze (react-freeze) or get deprioritized
 * (React <Activity>), depending on the chosen behavior. This prevents off-screen components from re-rendering
 * on the critical path. Persistent screens (e.g. sidebar on web) are excluded so they stay interactive.
 */
function wrapDescriptorsWithNonTopScreensBehavior<T extends Descriptor>(
    descriptors: Record<string, T>,
    state: PlatformStackNavigationState<ParamListBase>,
    behavior: NonTopScreensBehavior,
    persistentScreens?: string[],
): Record<string, T> {
    const NonTopScreenWrapper = WRAPPER_FOR_BEHAVIOR[behavior];
    const topRouteKey = state.routes[state.index]?.key;
    const result: Record<string, T> = {};
    for (const [key, descriptor] of Object.entries(descriptors)) {
        const isOnTop = key === topRouteKey;
        const isPersistent = persistentScreens?.includes(descriptor.route.name);
        const isScreenBlurred = !isOnTop && !isPersistent;
        result[key] = {
            ...descriptor,
            render: () => (
                <NonTopScreenWrapper
                    isScreenBlurred={isScreenBlurred}
                    routeKey={key}
                    routeName={descriptor.route.name}
                >
                    {descriptor.render()}
                </NonTopScreenWrapper>
            ),
        };
    }
    return result;
}

export default wrapDescriptorsWithNonTopScreensBehavior;
