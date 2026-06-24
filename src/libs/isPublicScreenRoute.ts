import {PUBLIC_SCREENS_ROUTES} from '@src/ROUTES';

export default function isPublicScreenRoute(route: string) {
    // Strip query parameters so that routes like "transition?exitTo=r/123" still
    // match the "transition" entry in PUBLIC_SCREENS_ROUTES.
    const routeWithoutQueryParams = route.split('?')[0];
    return Object.values(PUBLIC_SCREENS_ROUTES).some((screenRoute) => {
        const routeRegex = new RegExp(`^${screenRoute.replaceAll(/:\w+/g, '\\w+')}$`);
        return routeRegex.test(routeWithoutQueryParams);
    });
}
