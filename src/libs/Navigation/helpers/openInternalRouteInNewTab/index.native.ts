import type {Route} from '@src/ROUTES';

import type {ModifiedMouseEvent} from './types';

const isModifiedMousePress: (event?: ModifiedMouseEvent) => boolean = () => false;

/** Native has no address bar to point at, so nothing ever becomes an anchor. */
const getRouteURL: (route: Route) => string | undefined = () => undefined;

const openInternalRouteInNewTab: (route: Route, event?: ModifiedMouseEvent) => boolean = () => false;

export {isModifiedMousePress, getRouteURL};
export type {ModifiedMouseEvent};
export default openInternalRouteInNewTab;
