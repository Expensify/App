import {NavigationContext} from '@react-navigation/core';
import type {NavigationProp} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import type {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import React, {forwardRef, useContext, useMemo} from 'react';

type AddListenerCallback = () => void;

type RemoveListenerCallback = () => void;

type NavigationContextValue = {
    isFocused: () => boolean;
    addListener: () => AddListenerCallback;
    removeListener: () => RemoveListenerCallback;
};

export default function <TProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): (props: TProps & RefAttributes<TRef>) => ReactElement | null {
    function WithNavigationFallback(props: TProps, ref: ForwardedRef<TRef>) {
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
                ref={ref}
            />
        ) : (
            <NavigationContext.Provider value={navigationContextValue as unknown as NavigationProp<ParamListBase>}>
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            </NavigationContext.Provider>
        );
    }

    WithNavigationFallback.displayName = 'WithNavigationFocusWithFallback';

    return forwardRef(WithNavigationFallback);
}
