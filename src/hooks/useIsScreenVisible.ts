import {ScreenVisibleInRenderContext} from '@components/ScreenWrapper/ScreenVisibilityContext';

import {useContext, useSyncExternalStore} from 'react';

import useScreenVisibilityStore from './useScreenVisibilityStore';

/**
 * Whether the user can see this component's screen. Re-renders when that changes.
 * A cover shows in the render that computes it and an uncover only once the store publishes it, so a caller never acts on a stale "visible".
 */
export default function useIsScreenVisible(): boolean {
    const visibility = useScreenVisibilityStore();
    const isPublishedVisible = useSyncExternalStore(visibility.subscribe, visibility.getIsVisible);
    const isVisibleInRender = useContext(ScreenVisibleInRenderContext);
    return isPublishedVisible && isVisibleInRender;
}
