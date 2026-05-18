import type {Route} from '@src/ROUTES';

type ModifiedMouseEvent = {
    preventDefault?: () => void;
    stopPropagation?: () => void;
    metaKey?: boolean;
    ctrlKey?: boolean;
    button?: number;
    key?: string;
    nativeEvent?: unknown;
};

const isModifiedMousePress: (event?: ModifiedMouseEvent) => boolean = () => false;

const openInternalRouteInNewTab: (route: Route, event?: ModifiedMouseEvent) => boolean = () => false;

export {isModifiedMousePress};
export type {ModifiedMouseEvent};
export default openInternalRouteInNewTab;
