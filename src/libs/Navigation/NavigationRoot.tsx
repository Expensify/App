import type {NavigationState} from '@react-navigation/native';
import {DarkTheme, DefaultTheme, findFocusedRoute, getPathFromState, NavigationContainer} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import {useCurrentReportIDActions} from '@hooks/useCurrentReportID';
import useGuardedNavigationState from '@hooks/useGuardedNavigationState';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemePreference from '@hooks/useThemePreference';
import Firebase from '@libs/Firebase';
import FS from '@libs/Fullstory';
import Log from '@libs/Log';
import shouldOpenLastVisitedPath from '@libs/shouldOpenLastVisitedPath';
import {getPathFromURL} from '@libs/Url';
import {updateLastVisitedPath} from '@userActions/App';
import {updateOnboardingLastVisitedPath} from '@userActions/Welcome';
import CONST from '@src/CONST';
import {endSpan, getSpan, startSpan} from '@src/libs/telemetry/activeSpans';
import {navigationIntegration} from '@src/libs/telemetry/integrations';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import AppNavigator from './AppNavigator';
import {cleanPreservedNavigatorStates} from './AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {isWorkspacesTabScreenName} from './helpers/isNavigatorName';
import {saveSettingsTabPathToSessionStorage, saveWorkspacesTabPathToSessionStorage} from './helpers/lastVisitedTabPathUtils';
import {linkingConfig} from './linkingConfig';
import Navigation, {navigationRef} from './Navigation';

type NavigationRootProps = {
    /** Whether the current user is logged in with an authToken */
    authenticated: boolean;

    /** Stores path of last visited page */
    lastVisitedPath: Route;

    /** Initial url */
    initialUrl: string | null;

    /** Fired when react-navigation is ready */
    onReady: () => void;
};

/**
 * Intercept navigation state changes and log it
 */
function parseAndLogRoute(state: NavigationState) {
    if (!state) {
        return;
    }

    const currentPath = getPathFromState(state, linkingConfig.config);

    const focusedRoute = findFocusedRoute(state);

    if (focusedRoute && !CONST.EXCLUDE_FROM_LAST_VISITED_PATH.includes(focusedRoute?.name)) {
        updateLastVisitedPath(currentPath);
        if (currentPath.startsWith(`/${ROUTES.ONBOARDING_ROOT.route}`)) {
            updateOnboardingLastVisitedPath(currentPath);
        }
    }

    // Don't log the route transitions from OldDot because they contain authTokens
    if (currentPath.includes('/transition')) {
        Log.info('Navigating from transition link from OldDot using short lived authToken');
    } else {
        Log.info('Navigating to route', false, {path: currentPath});
    }

    Navigation.setIsNavigationReady();
    if (isWorkspacesTabScreenName(state.routes.at(-1)?.name)) {
        saveWorkspacesTabPathToSessionStorage(currentPath);
    } else if (state.routes.at(-1)?.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR) {
        saveSettingsTabPathToSessionStorage(currentPath);
    }

    // Fullstory Page navigation tracking
    const focusedRouteName = focusedRoute?.name;
    if (focusedRouteName) {
        new FS.Page(focusedRouteName, {path: currentPath}).start();
    }
}

function NavigationRoot({authenticated, lastVisitedPath, initialUrl, onReady}: NavigationRootProps) {
    const firstRenderRef = useRef(true);
    const themePreference = useThemePreference();
    const theme = useTheme();
    const {cleanStaleScrollOffsets} = useContext(ScrollOffsetContext);

    const {updateCurrentReportID} = useCurrentReportIDActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [isOnboardingCompleted = true] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
        canBeMissing: true,
    });

    const previousAuthenticated = usePrevious(authenticated);

    const guardedLastVisitedState = useGuardedNavigationState(lastVisitedPath, linkingConfig.config);
    const path = initialUrl ? getPathFromURL(initialUrl) : null;
    const guardedDeepLinkState = useGuardedNavigationState(path, linkingConfig.config);

    const initialState = useMemo(() => {
        if (path?.includes(ROUTES.MIGRATED_USER_WELCOME_MODAL.route) && shouldOpenLastVisitedPath(lastVisitedPath) && isOnboardingCompleted && authenticated) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(ROUTES.MIGRATED_USER_WELCOME_MODAL.getRoute());
            });

            return guardedLastVisitedState;
        }

        if (!account || account.isFromPublicDomain) {
            return;
        }

        const isTransitioning = path?.includes(ROUTES.TRANSITION_BETWEEN_APPS);

        // If we have a transition URL, don't restore last visited path - let React Navigation handle it
        // This prevents reusing deep links after logout regardless of authentication status
        if (isTransitioning) {
            return undefined;
        }

        if (shouldOpenLastVisitedPath(lastVisitedPath) && authenticated) {
            // Only skip restoration if there's a specific deep link that's not the root
            // This allows restoration when app is killed and reopened without a deep link
            const isRootPath = !path || path === '' || path === '/';
            const isSpecificDeepLink = path && !isRootPath;

            if (!isSpecificDeepLink) {
                Log.info('Restoring last visited path on app startup', false, {lastVisitedPath, initialUrl, path});
                return guardedLastVisitedState;
            }
        }

        // If there's a specific deep link, use guarded state to ensure guards are evaluated
        // This prevents incomplete-onboarding users from bypassing guards via deep links
        if (path && path !== '' && path !== '/') {
            return guardedDeepLinkState;
        }

        // Default behavior - let React Navigation handle the initial state
        return undefined;

        // The initialState value is relevant only on the first render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // https://reactnavigation.org/docs/themes
    const navigationTheme = useMemo(() => {
        const defaultNavigationTheme = themePreference === CONST.THEME.DARK ? DarkTheme : DefaultTheme;

        return {
            ...defaultNavigationTheme,
            colors: {
                ...defaultNavigationTheme.colors,
                /**
                 * We want to have a stack with variable size of screens in RHP (wide layout).
                 * The stack is the size of the biggest screen in RHP. Screens that should be smaller will reduce its size with margin.
                 * The stack has to be this size because it has a container with overflow: hidden.
                 * On wide layout, background: 'transparent' is used to make the bottom of the card stack transparent.
                 * On narrow layout, we use theme.appBG to match the standard app background.
                 */
                background: shouldUseNarrowLayout ? theme.appBG : 'transparent',
            },
        };
    }, [shouldUseNarrowLayout, theme.appBG, themePreference]);

    useEffect(() => {
        startSpan(CONST.TELEMETRY.SPAN_NAVIGATION_ROOT_READY, {
            name: CONST.TELEMETRY.SPAN_NAVIGATION_ROOT_READY,
            op: CONST.TELEMETRY.SPAN_NAVIGATION_ROOT_READY,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT),
        });
    }, []);

    useEffect(() => {
        if (firstRenderRef.current) {
            // we don't want to make the report back button go back to LHN if the user
            // started on the small screen so we don't set it on the first render
            // making it only work on consecutive changes of the screen size
            firstRenderRef.current = false;
            return;
        }

        // After resizing the screen from wide to narrow, if we have visited multiple central screens, we want to go back to the LHN screen, so we set shouldPopToSidebar to true.
        // Now when this value is true, Navigation.goBack with the option {shouldPopToTop: true} will remove all visited central screens in the given tab from the navigation stack and go back to the LHN.
        // More context here: https://github.com/Expensify/App/pull/59300
        if (!shouldUseNarrowLayout) {
            return;
        }

        Navigation.setShouldPopToSidebar(true);
    }, [shouldUseNarrowLayout]);

    useEffect(() => {
        // Since the NAVIGATORS.REPORTS_SPLIT_NAVIGATOR url is "/" and it has to be used as an URL for SignInPage,
        // this navigator should be the only one in the navigation state after logout.
        const hasUserLoggedOut = !authenticated && !!previousAuthenticated;
        if (!hasUserLoggedOut || !navigationRef.isReady()) {
            return;
        }

        const rootState = navigationRef.getRootState();
        const lastRoute = rootState.routes.at(-1);
        if (!lastRoute) {
            return;
        }

        // REPORTS_SPLIT_NAVIGATOR will persist after user logout, because it is used both for logged-in and logged-out users
        // That's why for ReportsSplit we need to explicitly clear params when resetting navigation state,
        // However in case other routes (related to login/logout) appear in nav state, then we want to preserve params for those
        const isReportSplitNavigatorMounted = lastRoute.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
        navigationRef.reset({
            ...rootState,
            index: 0,
            routes: [
                {
                    ...lastRoute,
                    params: isReportSplitNavigatorMounted ? undefined : lastRoute.params,
                },
            ],
        });
    }, [authenticated, previousAuthenticated]);

    const handleStateChange = (state: NavigationState | undefined) => {
        if (!state) {
            return;
        }
        const currentRoute = navigationRef.getCurrentRoute();
        Firebase.log(`[NAVIGATION] screen: ${currentRoute?.name}, params: ${JSON.stringify(currentRoute?.params ?? {})}`);

        updateCurrentReportID(state);
        parseAndLogRoute(state);

        // We want to clean saved scroll offsets for screens that aren't anymore in the state.
        cleanStaleScrollOffsets(state);
        cleanPreservedNavigatorStates(state);
    };

    const onReadyWithSentry = useCallback(() => {
        endSpan(CONST.TELEMETRY.SPAN_NAVIGATION_ROOT_READY);
        endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.NAVIGATION);
        onReady();
        navigationIntegration.registerNavigationContainer(navigationRef);
    }, [onReady]);

    return (
        <NavigationContainer
            initialState={initialState}
            onStateChange={handleStateChange}
            onReady={onReadyWithSentry}
            theme={navigationTheme}
            ref={navigationRef}
            linking={linkingConfig}
            documentTitle={{
                enabled: false,
            }}
        >
            <AppNavigator authenticated={authenticated} />
        </NavigationContainer>
    );
}

export default NavigationRoot;
