import React from 'react';
import PropTypes from 'prop-types';
import {NavigationContext} from '@react-navigation/core';
import getComponentDisplayName from '../libs/getComponentDisplayName';

export default function (WrappedComponent) {
    const WithNavigationFallback = (props) => {
        // Use hook to determine if context is available. Class component does provide direct way of getting the context availability
        const navigation = React.useContext(NavigationContext);

        if (!navigation) {
            return (
                <NavigationContext.Provider
                    value={{
                        isFocused: () => true,
                        addListener: () => {},
                        removeListener: () => {},
                    }}
                >
                    <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        ref={props.forwardedRef}
                    />
                </NavigationContext.Provider>
            );
        }

        // eslint-disable-next-line react/jsx-props-no-spreading
        return <WrappedComponent {...props} ref={props.forwardedRef} />;
    };

    WithNavigationFallback.displayName = `WithNavigationFocusWithFallback(${getComponentDisplayName(WrappedComponent)})`;
    WithNavigationFallback.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithNavigationFallback.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithNavigationFallback {...props} forwardedRef={ref} />
    ));
}
