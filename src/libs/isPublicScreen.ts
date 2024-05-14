import ROUTES from '@src/ROUTES';

const publicScreenRoutes: string[] = [
    ROUTES.ROOT,
    ROUTES.TRANSITION_BETWEEN_APPS,
    ROUTES.VALIDATE_LOGIN,
    ROUTES.CONNECTION_COMPLETE,
    ROUTES.UNLINK_LOGIN,
    ROUTES.APPLE_SIGN_IN,
    ROUTES.GOOGLE_SIGN_IN,
    ROUTES.SAML_SIGN_IN,
];

export default function isPublicScreen(route: string) {
    return publicScreenRoutes.some((screenRoute) => {
        const routeRegex = new RegExp(`^${screenRoute.replace(/:\w+/g, '\\w+')}$`);
        return routeRegex.test(route);
    });
}
