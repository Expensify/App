import type {NavigationProp} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import type {ComponentType} from 'react';

import {IsFocusedContext, NavigationContext} from '@react-navigation/core';
import React, {use, useContext, useEffect, useState} from 'react';

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

/**
 * RN8: useIsFocused throws when IsFocusedContext is missing (component not inside a screen).
 * v7 fell back to navigation.isFocused() with focus/blur subscription. This provider restores
 * that behavior for components mounted outside a screen (modals, navigator ExtraContent).
 */
function IsFocusedFallbackProvider({navigation, children}: {navigation: NavigationProp<ParamListBase> | undefined; children: React.ReactNode}) {
    const [isFocused, setIsFocused] = useState(() => navigation?.isFocused?.() ?? true);

    useEffect(() => {
        if (!navigation?.addListener) {
            return;
        }
        setIsFocused(navigation.isFocused?.() ?? true);
        const unsubscribeFocus = navigation.addListener('focus', () => setIsFocused(true));
        const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false));
        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation]);

    return <IsFocusedContext.Provider value={isFocused}>{children}</IsFocusedContext.Provider>;
}

function WithNavigationFallbackImpl<TProps extends Record<string, unknown>>({WrappedComponent, ...props}: WithNavigationFallbackImplProps<TProps>) {
    const context = useContext(NavigationContext);
    const isFocusedContext = use(IsFocusedContext);

    let content = <WrappedComponent {...(props as unknown as TProps)} />;

    if (isFocusedContext === undefined) {
        content = <IsFocusedFallbackProvider navigation={context}>{content}</IsFocusedFallbackProvider>;
    }

    if (!context) {
        content = <NavigationContext.Provider value={FALLBACK_NAVIGATION_CONTEXT_VALUE as unknown as NavigationProp<ParamListBase>}>{content}</NavigationContext.Provider>;
    }

    return content;
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
