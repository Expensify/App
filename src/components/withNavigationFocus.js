import React from 'react';
import PropTypes from 'prop-types';
import {useIsFocused} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import refPropTypes from './refPropTypes';

const withNavigationFocusPropTypes = {
    isFocused: PropTypes.bool.isRequired,
};

export default function withNavigationFocus(WrappedComponent) {
    function WithNavigationFocus(props) {
        const isFocused = useIsFocused();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                isFocused={isFocused}
            />
        );
    }

    WithNavigationFocus.displayName = `withNavigationFocus(${getComponentDisplayName(WrappedComponent)})`;
    WithNavigationFocus.propTypes = {
        forwardedRef: refPropTypes,
    };
    WithNavigationFocus.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        <WithNavigationFocus
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}

export {withNavigationFocusPropTypes};
