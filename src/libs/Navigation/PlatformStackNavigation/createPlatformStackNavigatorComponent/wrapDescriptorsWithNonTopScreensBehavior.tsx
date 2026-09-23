import type {NonTopScreenBehavior, PlatformSpecificNavigationOptions, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

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
    options: PlatformSpecificNavigationOptions & Pick<PlatformStackNavigationOptions, 'nonTopScreenBehavior'>;

    /** Render function for the screen content, wrapped with the non-top screen wrapper */
    render: () => React.JSX.Element;
};

const WRAPPER_FOR_BEHAVIOR: Record<Exclude<NonTopScreenBehavior, 'none'>, ComponentType<NonTopScreenWrapperProps>> = {
    freeze: ScreenFreezeWrapper,
    activity: ScreenActivityWrapper,
};

/**
 * Wraps each screen's render function with the wrapper its nonTopScreenBehavior option picked, which keeps covered
 * screens off the critical path. Screens that picked no behavior and persistent screens (e.g. the sidebar on web)
 * stay unwrapped, because a persistent screen remains interactive alongside the top screen.
 */
function wrapDescriptorsWithNonTopScreensBehavior<T extends Descriptor>(
    descriptors: Record<string, T>,
    state: PlatformStackNavigationState<ParamListBase>,
    persistentScreens?: string[],
): Record<string, T> {
    const topRouteKey = state.routes[state.index]?.key;
    let result: Record<string, T> | undefined;
    for (const [key, descriptor] of Object.entries(descriptors)) {
        const behavior = persistentScreens?.includes(descriptor.route.name) ? 'none' : (descriptor.options.nonTopScreenBehavior ?? 'none');
        if (behavior === 'none') {
            continue;
        }
        result ??= {...descriptors};
        const NonTopScreenWrapper = WRAPPER_FOR_BEHAVIOR[behavior];
        // The state always carries a top route, but a missing key must leave every screen visible instead of blurring the whole stack.
        const isScreenBlurred = topRouteKey !== undefined && key !== topRouteKey;
        result[key] = {
            ...descriptor,
            render: () => <NonTopScreenWrapper isScreenBlurred={isScreenBlurred}>{descriptor.render()}</NonTopScreenWrapper>,
        };
    }
    return result ?? descriptors;
}

export default wrapDescriptorsWithNonTopScreensBehavior;
