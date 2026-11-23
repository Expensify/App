import type {Route} from '@src/ROUTES';

/** Starts the route at the site root, so a link to it does not resolve against the current page's path. */
function getRoutePath(route: Route): string {
    return route.startsWith('/') ? route : `/${route}`;
}

export default getRoutePath;
