import React, {useEffect, forwardRef, useState, ComponentType, RefAttributes, ForwardedRef} from 'react';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import addViewportResizeListener from '../libs/VisualViewport';

type ViewportOffsetTopProps = {
    // viewportOffsetTop returns the offset of the top edge of the visual viewport from the
    // top edge of the layout viewport in CSS pixels, when the visual viewport is resized.
    viewportOffsetTop: number;
};

export default function withViewportOffsetTop<TProps extends ViewportOffsetTopProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
    function WithViewportOffsetTop(props: Omit<TProps, keyof ViewportOffsetTopProps>, ref: ForwardedRef<TRef>) {
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
                ref={ref}
                viewportOffsetTop={viewportOffsetTop}
            />
        );
    }

    WithViewportOffsetTop.displayName = `WithViewportOffsetTop(${getComponentDisplayName(WrappedComponent)})`;

    return forwardRef(WithViewportOffsetTop);
}
