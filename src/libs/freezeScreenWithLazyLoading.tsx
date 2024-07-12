import memoize from 'lodash/memoize';
import React from 'react';
import FreezeWrapper from './Navigation/FreezeWrapper';

function FrozenScreen<TProps extends React.JSX.IntrinsicAttributes>(WrappedComponent: React.ComponentType<TProps>) {
    return (props: TProps) => (
        <FreezeWrapper>
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </FreezeWrapper>
    );
}

export default function freezeScreenWithLazyLoading(lazyComponent: () => React.ComponentType) {
    return memoize(() => {
        const Component = lazyComponent();
        return FrozenScreen(Component);
    });
}
