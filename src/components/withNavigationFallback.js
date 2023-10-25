import React, {forwardRef, useContext, useMemo} from 'react';
import {NavigationContext} from '@react-navigation/core';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import refPropTypes from './refPropTypes';

export default function (WrappedComponent) {
    function WithNavigationFallback(props) {
        const context = useContext(NavigationContext);

        const navigationContextValue = useMemo(() => ({isFocused: () => true, addListener: () => () => {}, removeListener: () => () => {}}), []);

        return context ? (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
            />
        ) : (
            <NavigationContext.Provider value={navigationContextValue}>
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={props.forwardedRef}
                />
            </NavigationContext.Provider>
        );
    }
    WithNavigationFallback.displayName = `WithNavigationFocusWithFallback(${getComponentDisplayName(WrappedComponent)})`;
    WithNavigationFallback.propTypes = {
        forwardedRef: refPropTypes,
    };
    WithNavigationFallback.defaultProps = {
        forwardedRef: undefined,
    };

    const WithNavigationFallbackWithRef = forwardRef((props, ref) => (
        <WithNavigationFallback
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithNavigationFallbackWithRef.displayName = `WithNavigationFallbackWithRef`;

    return WithNavigationFallbackWithRef;
}
