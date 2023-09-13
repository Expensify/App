import React, {forwardRef, useContext} from 'react';
import {NavigationContext} from '@react-navigation/core';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import refPropTypes from './refPropTypes';

export default function (WrappedComponent) {
    function WithNavigationFallback(props) {
        const context = useContext(NavigationContext);

        return !context ? (
            <NavigationContext.Provider
                value={{
                    isFocused: () => true,
                    addListener: () => () => {},
                    removeListener: () => () => {},
                }}
            >
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={props.forwardedRef}
                />
            </NavigationContext.Provider>
        ) : (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
            />
        );
    }
    WithNavigationFallback.displayName = `WithNavigationFocusWithFallback(${getComponentDisplayName(WrappedComponent)})`;
    WithNavigationFallback.propTypes = {
        forwardedRef: refPropTypes,
    };
    WithNavigationFallback.defaultProps = {
        forwardedRef: undefined,
    };

    return forwardRef((props, ref) => (
        <WithNavigationFallback
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}
