import {NavigationContext} from '@react-navigation/core';
import type {NavigationProp} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import type {ComponentType, ReactElement} from 'react';
import React, {useContext, useMemo} from 'react';

type AddListenerCallback = () => void;

type RemoveListenerCallback = () => void;

type NavigationContextValue = {
    isFocused: () => boolean;
    addListener: () => AddListenerCallback;
    removeListener: () => RemoveListenerCallback;
};

export default function <TProps extends Record<string, unknown>>(WrappedComponent: ComponentType<TProps>): (props: TProps) => ReactElement | null {
    function WithNavigationFallback(props: TProps) {
        const context = useContext(NavigationContext);

        const navigationContextValue: NavigationContextValue = useMemo(
            () => ({
                isFocused: () => true,
                addListener: () => () => {},
                removeListener: () => () => {},
            }),
            [],
        );

        return context ? (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        ) : (
            <NavigationContext.Provider value={navigationContextValue as unknown as NavigationProp<ParamListBase>}>
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </NavigationContext.Provider>
        );
    }

    WithNavigationFallback.displayName = `WithNavigationFallback(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`;

    return WithNavigationFallback;
}
