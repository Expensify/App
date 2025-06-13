import type {Route} from '@src/ROUTES';

export default function shouldOpenLastVisitedPath(lastVisitedPath: Route) {
    return !!lastVisitedPath;
}
