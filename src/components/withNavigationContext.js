import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {useIsFocused} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const navigationContextPropTypes = {
    // Whether this screen is focused
    isScreenFocused: PropTypes.bool.isRequired,
};

export default function (WrappedComponent) {
    function withNavigationContext(props) {
        const isScreenFocused = useIsFocused();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isScreenFocused={isScreenFocused}
            />
        );
    }

    withNavigationContext.displayName = `withNavigationContext(${getComponentDisplayName(WrappedComponent)})`;
    return withNavigationContext;
}

export {
    navigationContextPropTypes,
};
