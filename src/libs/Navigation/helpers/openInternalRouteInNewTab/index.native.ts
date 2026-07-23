import type {Route} from '@src/ROUTES';

import type {ModifiedMouseEvent} from './types';

const isModifiedMousePress: (event?: ModifiedMouseEvent) => boolean = () => false;

const openInternalRouteInNewTab: (route: Route, event?: ModifiedMouseEvent) => boolean = () => false;

export {isModifiedMousePress};
export type {ModifiedMouseEvent};
export default openInternalRouteInNewTab;
