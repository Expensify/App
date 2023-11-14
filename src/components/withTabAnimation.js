import {useTabAnimation} from '@react-navigation/material-top-tabs';
import PropTypes from 'prop-types';
import * as React from 'react';
import _ from 'underscore';
import getComponentDisplayName from '@libs/getComponentDisplayName';

const propTypes = {
    /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
     * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
    forwardedRef: PropTypes.func,

    /* Whether we're in a tab navigator */
    isInTabNavigator: PropTypes.bool.isRequired,
};

const defaultProps = {
    forwardedRef: () => {},
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

    WrappedComponentWithTabAnimation.displayName = `withAnimation(${getComponentDisplayName(WrappedComponent)})`;

    function WithTabAnimation(props) {
        const rest = _.omit(props, ['forwardedRef']);
        if (props.isInTabNavigator) {
            return (
                <WrappedComponentWithTabAnimation
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                    ref={props.forwardedRef}
                />
            );
        }
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                ref={props.forwardedRef}
            />
        );
    }

    WithTabAnimation.propTypes = propTypes;
    WithTabAnimation.defaultProps = defaultProps;
    WithTabAnimation.displayName = `withTabAnimation(${getComponentDisplayName(WrappedComponent)})`;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const WithTabAnimationWithRef = React.forwardRef((props, ref) => (
        <WithTabAnimation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithTabAnimationWithRef.displayName = 'WithTabAnimationWithRef';

    return WithTabAnimation;
}
