import React from 'react';
import FreezeWrapper from './Navigation/FreezeWrapper';

function FrozenComponent<TProps extends React.JSX.IntrinsicAttributes>(InnerComponent: React.ComponentType<TProps>) {
    return (props: TProps) => (
        <FreezeWrapper>
            <InnerComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </FreezeWrapper>
    );
}

export default function freezeScreenWithLazyLoading(componentGetter: () => React.ComponentType) {
    return () => {
        const Component = componentGetter();
        return FrozenComponent(Component);
    };
}
