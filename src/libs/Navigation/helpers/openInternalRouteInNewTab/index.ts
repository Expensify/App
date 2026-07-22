import type {Route} from '@src/ROUTES';

import type {ModifiedMouseEvent, ModifiedMouseEventSource} from './types';

function getRouteURL(route: Route) {
    return new URL(route.startsWith('/') ? route : `/${route}`, window.location.origin).toString();
}

function isModifiedMousePress(event?: ModifiedMouseEvent) {
    const mouseEvent = event?.nativeEvent && typeof event.nativeEvent === 'object' ? (event.nativeEvent as ModifiedMouseEventSource) : event;

    if (!mouseEvent || 'key' in mouseEvent) {
        return false;
    }

    const isPrimaryButton = mouseEvent.button === undefined || mouseEvent.button === 0;
    return isPrimaryButton && (!!mouseEvent.metaKey || !!mouseEvent.ctrlKey);
}

function openInternalRouteInNewTab(route: Route, event?: ModifiedMouseEvent) {
    if (!isModifiedMousePress(event) || typeof window === 'undefined') {
        return false;
    }

    event?.preventDefault?.();
    event?.stopPropagation?.();
    window.open(getRouteURL(route), '_blank', 'noopener,noreferrer');
    return true;
}

export {isModifiedMousePress};
export type {ModifiedMouseEvent};
export default openInternalRouteInNewTab;
