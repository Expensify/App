import type React from 'react';
import freezeScreenWithLazyLoading from '@libs/freezeScreenWithLazyLoading';

/**
 * This HOC is dependent on the platform. On native platforms, screens that aren't already displayed in the navigation stack should be frozen to prevent unnecessary rendering.
 * It's handled this way only on mobile platforms because on the web, more than one screen is displayed in a wide layout, so these screens shouldn't be frozen.
 */
export default function withPrepareCentralPaneScreen(componentGetter: () => React.ComponentType) {
    return freezeScreenWithLazyLoading(componentGetter);
}
