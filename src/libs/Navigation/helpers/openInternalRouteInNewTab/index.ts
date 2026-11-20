import getRoutePath from '@libs/Navigation/helpers/getRoutePath';

import type {Route} from '@src/ROUTES';

import type {ModifiedMouseEvent, ModifiedMouseEventSource} from './types';

function getRouteURL(route: Route) {
    return new URL(getRoutePath(route), window.location.origin).toString();
}

function getPrimaryButtonMouseEvent(event?: ModifiedMouseEvent): ModifiedMouseEventSource | undefined {
    const mouseEvent = event?.nativeEvent && typeof event.nativeEvent === 'object' ? (event.nativeEvent as ModifiedMouseEventSource) : event;

    if (!mouseEvent || 'key' in mouseEvent) {
        return undefined;
    }

    const isPrimaryButton = mouseEvent.button === undefined || mouseEvent.button === 0;
    return isPrimaryButton ? mouseEvent : undefined;
}

function isModifiedMousePress(event?: ModifiedMouseEvent) {
    const mouseEvent = getPrimaryButtonMouseEvent(event);
    return !!mouseEvent?.metaKey || !!mouseEvent?.ctrlKey;
}

/** Browsers open a link in a new window on a Shift click, so a real link leaves that click to the browser too. */
function isNewTabOrWindowMousePress(event?: ModifiedMouseEvent) {
    return isModifiedMousePress(event) || !!getPrimaryButtonMouseEvent(event)?.shiftKey;
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

export {isModifiedMousePress, isNewTabOrWindowMousePress};
export type {ModifiedMouseEvent};
export default openInternalRouteInNewTab;
