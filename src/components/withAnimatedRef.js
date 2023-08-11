import React from 'react';
import {useAnimatedRef} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';

export default function withAnimatedRef(WrappedComponent) {
    function WithAnimatedRef(props) {
        const animatedRef = useAnimatedRef();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                animatedRef={animatedRef}
            />
        );
    }
    WithAnimatedRef.displayName = `withAnimatedRef(${getComponentDisplayName(WrappedComponent)})`;
    WithAnimatedRef.propTypes = {
        // eslint-disable-next-line react/forbid-prop-types
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.object})]),
    };
    WithAnimatedRef.defaultProps = {
        forwardedRef: undefined,
    };

    return React.forwardRef((props, ref) => (
        <WithAnimatedRef
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}
