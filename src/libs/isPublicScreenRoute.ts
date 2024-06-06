import {PUBLIC_SCREENS_ROUTES} from '@src/ROUTES';

export default function isPublicScreenRoute(route: string) {
    return Object.values(PUBLIC_SCREENS_ROUTES).some((screenRoute) => {
        const routeRegex = new RegExp(`^${screenRoute.replace(/:\w+/g, '\\w+')}$`);
        return routeRegex.test(route);
    });
}
