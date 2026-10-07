import Log from '@libs/Log';

import type {NavigationProp} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import type {ComponentType} from 'react';

import {NavigationContext} from '@react-navigation/core';
import React, {useContext} from 'react';

type AddListenerCallback = () => void;

type RemoveListenerCallback = () => void;

type NavigationContextValue = {
    isFocused: () => boolean;
    addListener: () => AddListenerCallback;
    removeListener: () => RemoveListenerCallback;
    setParams: (params: Record<string, unknown>) => void;
    setOptions: (options: Record<string, unknown>) => void;
    navigate: (...args: unknown[]) => void;
    dispatch: (...args: unknown[]) => void;
    goBack: () => void;
    canGoBack: () => boolean;
    getState: () => undefined;
    getParent: () => undefined;
};

function logInertCall(method: string) {
    // Throwing would only crash the user: the misuse shows up when the call happens (an event or effect), never at render.
    // `alert` attaches a stack and its prefix is forwarded to Sentry (FORWARDED_LOG_PREFIXES), so we still see the call site.
    Log.alert(`[withNavigationFallback] ignored navigation.${method}() outside a navigator screen`, {method});
}

/**
 * Used by trees rendered outside a navigator screen (e.g. the side panel report). There is no screen to act on,
 * so actions are inert - but callable, since a missing method throws `x is not a function` in the caller.
 * Action-shaped no-ops log so a swallowed call isn't mistaken for a dead `Button`. State-shaped ones stay silent.
 */
const FALLBACK_NAVIGATION_CONTEXT_VALUE: NavigationContextValue = {
    isFocused: () => true,
    addListener: () => () => {},
    removeListener: () => () => {},
    setParams: () => logInertCall('setParams'),
    setOptions: () => logInertCall('setOptions'),
    navigate: () => logInertCall('navigate'),
    dispatch: () => logInertCall('dispatch'),
    goBack: () => logInertCall('goBack'),
    canGoBack: () => false,
    getState: () => undefined,
    getParent: () => undefined,
};

type WithNavigationFallbackImplProps<TProps extends Record<string, unknown>> = {
    WrappedComponent: ComponentType<TProps>;
} & TProps;

function WithNavigationFallbackImpl<TProps extends Record<string, unknown>>({WrappedComponent, ...props}: WithNavigationFallbackImplProps<TProps>) {
    const context = useContext(NavigationContext);

    return context ? (
        <WrappedComponent {...(props as unknown as TProps)} />
    ) : (
        <NavigationContext.Provider value={FALLBACK_NAVIGATION_CONTEXT_VALUE as unknown as NavigationProp<ParamListBase>}>
            <WrappedComponent {...(props as unknown as TProps)} />
        </NavigationContext.Provider>
    );
}

export default function <TProps extends Record<string, unknown>>(WrappedComponent: ComponentType<TProps>): ComponentType<TProps> {
    function WithNavigationFallback(props: TProps) {
        return (
            <WithNavigationFallbackImpl
                WrappedComponent={WrappedComponent}
                {...props}
            />
        );
    }

    WithNavigationFallback.displayName = `WithNavigationFallback(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`;

    return WithNavigationFallback;
}

export {FALLBACK_NAVIGATION_CONTEXT_VALUE};
