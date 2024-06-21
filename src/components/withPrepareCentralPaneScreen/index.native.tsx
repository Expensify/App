import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';

/**
 * This HOC is dependent on the platform. On native platforms, screens that aren't already displayed in the navigation stack should be frozen to prevent unnecessary rendering.
 * It's handled this way only on mobile platforms because on the web, more than one screen is displayed in a wide layout, so these screens shouldn't be frozen.
 */
export default function withPrepareCentralPaneScreen<TProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: TProps & React.RefAttributes<TRef>) => React.ReactElement | null {
    function WithPrepareCentralPaneScreen(props: TProps, ref: ForwardedRef<TRef>) {
        return (
            <FreezeWrapper>
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            </FreezeWrapper>
        );
    }

    WithPrepareCentralPaneScreen.displayName = `WithPrepareCentralPaneScreen(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef(WithPrepareCentralPaneScreen);
}
