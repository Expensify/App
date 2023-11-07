import {useTabAnimation} from '@react-navigation/material-top-tabs';
import PropTypes from 'prop-types';
import * as React from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';

const propTypes = {
    /* Whether we're in a tab navigator */
    isInTabNavigator: PropTypes.bool.isRequired,
};

export default function (WrappedComponent) {
    function WrappedComponentWithTabAnimation(props) {
        const animation = useTabAnimation();

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                tabAnimation={animation}
            />
        );
    }

    function WithTabAnimation(props, ref) {
        if (props.isInTabNavigator) {
            return (
                <WrappedComponentWithTabAnimation
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            );
        }
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
            />
        );
    }

    WithTabAnimation.propTypes = propTypes;
    WithTabAnimation.displayName = `withTabAnimation(${getComponentDisplayName(WrappedComponent)})`;

    return React.forwardRef(WithTabAnimation);
}
