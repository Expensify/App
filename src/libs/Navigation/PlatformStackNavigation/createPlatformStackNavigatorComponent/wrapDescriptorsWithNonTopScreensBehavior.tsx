import type {NonTopScreenBehavior, PlatformSpecificNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';
import type {ComponentType} from 'react';

import React from 'react';

import type NonTopScreenWrapperProps from './nonTopScreenWrapperTypes';

import ScreenActivityWrapper from './ScreenActivityWrapper';
import ScreenFreezeWrapper from './ScreenFreezeWrapper';

type Descriptor = {
    /** Route object containing the screen name, used to check if the screen is persistent */
    route: {name: string};

    /** Resolved options of the screen, carrying the behavior it picked for the time it is covered by another one */
    options: PlatformSpecificNavigationOptions & {nonTopScreenBehavior?: NonTopScreenBehavior};

    /** Render function for the screen content, wrapped with the non-top screen wrapper */
    render: () => React.JSX.Element;
};

const WRAPPER_FOR_BEHAVIOR: Record<Exclude<NonTopScreenBehavior, 'none'>, ComponentType<NonTopScreenWrapperProps>> = {
    freeze: ScreenFreezeWrapper,
    activity: ScreenActivityWrapper,
};

/**
 * Wraps each screen's render function so that a non-top screen either freezes (react-freeze) or gets deprioritized
 * (React <Activity>), depending on its nonTopScreenBehavior option, which keeps covered screens off the critical
 * path. A screen that picked no behavior is left unwrapped, and so is a persistent screen (e.g. sidebar on web),
 * because it stays visible and interactive alongside the top screen even when the navigator loses focus.
 */
function wrapDescriptorsWithNonTopScreensBehavior<T extends Descriptor>(
    descriptors: Record<string, T>,
    state: PlatformStackNavigationState<ParamListBase>,
    persistentScreens?: string[],
): Record<string, T> {
    const topRouteKey = state.routes[state.index]?.key;
    const result: Record<string, T> = {};
    for (const [key, descriptor] of Object.entries(descriptors)) {
        const behavior = persistentScreens?.includes(descriptor.route.name) ? 'none' : (descriptor.options.nonTopScreenBehavior ?? 'none');
        if (behavior === 'none') {
            result[key] = descriptor;
            continue;
        }
        const NonTopScreenWrapper = WRAPPER_FOR_BEHAVIOR[behavior];
        const isScreenBlurred = key !== topRouteKey;
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
