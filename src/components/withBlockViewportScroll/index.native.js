/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';

export default function WithBlockViewportScrollHOC(WrappedComponent) {
    function PassThroughComponent(props, ref) {
        return (
            <WrappedComponent
                {...props}
                ref={ref}
            />
        );
    }

    PassThroughComponent.displayName = `PassThroughComponent(${getComponentDisplayName(WrappedComponent)})`;

    return React.forwardRef(PassThroughComponent);
}
