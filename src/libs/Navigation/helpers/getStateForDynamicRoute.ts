import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Dynamic route configuration mapping
 * Each dynamic route defines its navigation hierarchy
 *
 * Structure options:
 * - Simple: just 'screen' for direct navigation
 * - Modal: 'navigator' + 'screen' for 2-level navigation
 * - Nested: 'navigator' + 'modal' + 'screen' for 3-level navigation
 */
const DYNAMIC_ROUTE_CONFIG = {
    VERIFY_ACCOUNT: {
        navigator: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
        modal: SCREENS.RIGHT_MODAL.SETTINGS,
        screen: SCREENS.SETTINGS.VERIFY_ACCOUNT,
    },
    // Examples of different navigation levels:
    // SIMPLE_SCREEN: {
    //     screen: SCREENS.HOME,  // Direct navigation
    // },
    // MODAL_SCREEN: {
    //     navigator: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    //     screen: SCREENS.RIGHT_MODAL.PROFILE,  // 2-level navigation
    // },
} as const;

type DynamicRouteKey = keyof typeof DYNAMIC_ROUTE_CONFIG;

/**
 * Creates a navigation state structure for displaying dynamic routes.
 * Automatically detects the navigation level based on available config fields:
 * - navigator + modal + screen = 3-level nested navigation
 * - navigator + screen = 2-level modal navigation
 * - screen only = 1-level direct navigation
 *
 * @param path - The full path including the dynamic route suffix
 * @param dynamicRouteName - The name of the dynamic route (e.g., 'VERIFY_ACCOUNT')
 * @returns Navigation state object for the dynamic route
 */
function getStateForDynamicRoute(path: string, dynamicRouteName: string) {
    // Validate that the dynamic route is supported
    if (!(dynamicRouteName in DYNAMIC_ROUTE_CONFIG)) {
        throw new Error(`Dynamic route '${dynamicRouteName}' is not configured. Available routes: ${Object.keys(DYNAMIC_ROUTE_CONFIG).join(', ')}`);
    }

    const routeConfig = DYNAMIC_ROUTE_CONFIG[dynamicRouteName as DynamicRouteKey];

    // 3-level navigation: Navigator -> Modal -> Screen
    if (routeConfig.navigator && routeConfig.modal && routeConfig.screen) {
        return {
            routes: [
                {
                    name: routeConfig.navigator,
                    state: {
                        routes: [
                            {
                                name: routeConfig.modal,
                                state: {
                                    routes: [
                                        {
                                            name: routeConfig.screen,
                                            path,
                                        },
                                    ],
                                    index: 0,
                                },
                            },
                        ],
                        index: 0,
                    },
                },
            ],
        };
    }

    // 2-level navigation: Navigator -> Screen
    if (routeConfig.navigator && routeConfig.screen) {
        return {
            routes: [
                {
                    name: routeConfig.navigator,
                    state: {
                        routes: [
                            {
                                name: routeConfig.screen,
                                path,
                            },
                        ],
                        index: 0,
                    },
                },
            ],
        };
    }

    // 1-level navigation: Direct Screen
    if (routeConfig.screen) {
        return {
            routes: [
                {
                    name: routeConfig.screen,
                    path,
                },
            ],
        };
    }

    throw new Error(`Invalid route configuration for '${dynamicRouteName}'. Must have at least 'screen' field.`);
}
export default getStateForDynamicRoute;
