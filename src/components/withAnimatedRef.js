import React from 'react';
import {useAnimatedRef} from 'react-native-reanimated';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import refPropTypes from './refPropTypes';

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
        forwardedRef: refPropTypes,
    };
    WithAnimatedRef.defaultProps = {
        forwardedRef: undefined,
    };

    const WithAnimatedRefWithRef = React.forwardRef((props, ref) => (
        <WithAnimatedRef
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithAnimatedRefWithRef.displayName = 'WithAnimatedRefWithRef';

    return WithAnimatedRefWithRef;
}
