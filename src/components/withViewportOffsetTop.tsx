import getComponentDisplayName from '@libs/getComponentDisplayName';
import addViewportResizeListener from '@libs/VisualViewport';

import type {ComponentType} from 'react';

import React, {useEffect, useState} from 'react';

type ViewportOffsetTopProps = {
    // viewportOffsetTop returns the offset of the top edge of the visual viewport from the
    // top edge of the layout viewport in CSS pixels, when the visual viewport is resized.
    viewportOffsetTop: number;
};

type WithViewportOffsetTopImplProps<TProps extends ViewportOffsetTopProps> = {
    WrappedComponent: ComponentType<TProps>;
} & Omit<TProps, keyof ViewportOffsetTopProps>;

function WithViewportOffsetTopImpl<TProps extends ViewportOffsetTopProps>({WrappedComponent, ...props}: WithViewportOffsetTopImplProps<TProps>) {
    const [viewportOffsetTop, setViewportOffsetTop] = useState(0);

    useEffect(() => {
        const updateDimensions = (event: Event) => {
            const targetOffsetTop = (event.target instanceof VisualViewport && event.target.offsetTop) || 0;
            setViewportOffsetTop(targetOffsetTop);
        };

        const removeViewportResizeListener = addViewportResizeListener(updateDimensions);

        return () => {
            removeViewportResizeListener();
        };
    }, []);

    return (
        <WrappedComponent
            {...(props as unknown as TProps)}
            viewportOffsetTop={viewportOffsetTop}
        />
    );
}

export default function withViewportOffsetTop<TProps extends ViewportOffsetTopProps>(WrappedComponent: ComponentType<TProps>) {
    function WithViewportOffsetTop(props: Omit<TProps, keyof ViewportOffsetTopProps>) {
        return (
            <WithViewportOffsetTopImpl
                WrappedComponent={WrappedComponent}
                {...props}
            />
        );
    }

    WithViewportOffsetTop.displayName = `WithViewportOffsetTop(${getComponentDisplayName(WrappedComponent)})`;

    return WithViewportOffsetTop;
}
