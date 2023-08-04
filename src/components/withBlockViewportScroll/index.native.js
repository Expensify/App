/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../../libs/getComponentDisplayName';

export default function WithBlockViewportScrollHOC(WrappedComponent) {
    function PassThroughComponent(props) {
        return <WrappedComponent {...props} />;
    }

    PassThroughComponent.displayName = `PassThroughComponent(${getComponentDisplayName(WrappedComponent)})`;
    PassThroughComponent.propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
    };
    PassThroughComponent.defaultProps = {
        forwardedRef: undefined,
    };

    return React.forwardRef((props, ref) => (
        <PassThroughComponent
            {...props}
            forwardedRef={ref}
        />
    ));
}
