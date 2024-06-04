import type {ComponentType} from 'react';

/**
 * This HOC is dependent on platform. On native platforms screens that aren't already dipslayed in the navigation stack should be freezed to prevent from unnecessary rendering.
 * It's handled this way only on mobile platforms, because on web more than one screen is displayed in a wide layout, so these screens shouldn't be freezed.
 */
export default function withPrepareCentralPaneScreen(WrappedComponent: ComponentType) {
    return WrappedComponent;
}
