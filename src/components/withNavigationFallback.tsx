import React, {ComponentType, RefAttributes, ForwardedRef, forwardRef, useContext, useMemo} from 'react';
import {NavigationContext} from '@react-navigation/core';
import {NavigationProp} from '@react-navigation/native';
import {ParamListBase} from '@react-navigation/routers';
import getComponentDisplayName from '../libs/getComponentDisplayName';

type NavigationContextValue = {
    isFocused: () => boolean;
    addListener: () => () => void;
    removeListener: () => () => void;
};

export default function <TProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
    function WithNavigationFallback(props: TProps, ref: ForwardedRef<TRef>) {
        const context = useContext(NavigationContext);

        const navigationContextValue: NavigationContextValue = useMemo(() => ({isFocused: () => true, addListener: () => () => {}, removeListener: () => () => {}}), []);

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

    WithNavigationFallback.displayName = `WithNavigationFocusWithFallback(${getComponentDisplayName(WrappedComponent)})`;

    return forwardRef(WithNavigationFallback);
}
