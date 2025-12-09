import type {ComponentType} from 'react';
import React, {useEffect, useState} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import addViewportResizeListener from '@libs/VisualViewport';

type ViewportOffsetTopProps = {
    // viewportOffsetTop returns the offset of the top edge of the visual viewport from the
    // top edge of the layout viewport in CSS pixels, when the visual viewport is resized.
    viewportOffsetTop: number;
};

export default function withViewportOffsetTop<TProps extends ViewportOffsetTopProps>(WrappedComponent: ComponentType<TProps>) {
    function WithViewportOffsetTop(props: Omit<TProps, keyof ViewportOffsetTopProps>) {
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
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                viewportOffsetTop={viewportOffsetTop}
            />
        );
    }

    WithViewportOffsetTop.displayName = `WithViewportOffsetTop(${getComponentDisplayName(WrappedComponent)})`;

    return WithViewportOffsetTop;
}
