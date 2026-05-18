import type {Route} from '@src/ROUTES';

type ModifiedMouseEvent = {
    preventDefault?: () => void;
    stopPropagation?: () => void;
    metaKey?: boolean;
    ctrlKey?: boolean;
    button?: number;
    key?: string;
    nativeEvent?: {
        metaKey?: boolean;
        ctrlKey?: boolean;
        button?: number;
        key?: string;
    };
};

function isModifiedMousePress(_event?: ModifiedMouseEvent) {
    return false;
}

function openInternalRouteInNewTab(_route: Route, _event?: ModifiedMouseEvent) {
    return false;
}

export {isModifiedMousePress};
export type {ModifiedMouseEvent};
export default openInternalRouteInNewTab;
