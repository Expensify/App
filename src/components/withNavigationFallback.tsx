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
};

const FALLBACK_NAVIGATION_CONTEXT_VALUE: NavigationContextValue = {
    isFocused: () => true,
    addListener: () => () => {},
    removeListener: () => () => {},
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
