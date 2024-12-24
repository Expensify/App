import type {NavigationState} from '@react-navigation/native';
import {DarkTheme, DefaultTheme, findFocusedRoute, NavigationContainer} from '@react-navigation/native';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemePreference from '@hooks/useThemePreference';
import Firebase from '@libs/Firebase';
import {FSPage} from '@libs/Fullstory';
import Log from '@libs/Log';
import {hasCompletedGuidedSetupFlowSelector} from '@libs/onboardingSelectors';
import {getPathFromURL} from '@libs/Url';
import {updateLastVisitedPath} from '@userActions/App';
import * as Session from '@userActions/Session';
import {updateOnboardingLastVisitedPath} from '@userActions/Welcome';
import {getOnboardingInitialPath} from '@userActions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import AppNavigator from './AppNavigator';
import getPolicyIDFromState from './getPolicyIDFromState';
import linkingConfig from './linkingConfig';
import customGetPathFromState from './linkingConfig/customGetPathFromState';
import getAdaptedStateFromPath from './linkingConfig/getAdaptedStateFromPath';
import Navigation, {navigationRef} from './Navigation';
import setupCustomAndroidBackHandler from './setupCustomAndroidBackHandler';
import type {RootStackParamList} from './types';

type NavigationRootProps = {
    /** Whether the current user is logged in with an authToken */
    authenticated: boolean;

    /** Stores path of last visited page */
    lastVisitedPath: Route;

    /** Initial url */
    initialUrl: string | null;

    /** Fired when react-navigation is ready */
    onReady: () => void;

    /** Flag to indicate if the require 2FA modal should be shown to the user */
    shouldShowRequire2FAModal: boolean;
};

/**
 * Intercept navigation state changes and log it
 */
function parseAndLogRoute(state: NavigationState) {
    if (!state) {
        return;
    }

    const currentPath = customGetPathFromState(state, linkingConfig.config);

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

    // Fullstory Page navigation tracking
    const focusedRouteName = focusedRoute?.name;
    if (focusedRouteName) {
        new FSPage(focusedRouteName, {path: currentPath}).start();
    }
}

function NavigationRoot({authenticated, lastVisitedPath, initialUrl, onReady, shouldShowRequire2FAModal}: NavigationRootProps) {
    const firstRenderRef = useRef(true);
    const themePreference = useThemePreference();
    const theme = useTheme();
    const {cleanStaleScrollOffsets} = useContext(ScrollOffsetContext);

    const currentReportIDValue = useCurrentReportID();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {setActiveWorkspaceID} = useActiveWorkspace();
    const [user] = useOnyx(ONYXKEYS.USER);
    const isPrivateDomain = Session.isUserOnPrivateDomain();

    const [isOnboardingCompleted = true] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });

    const initialState = useMemo(() => {
        if (!user || user.isFromPublicDomain) {
            return;
        }

        // If the user haven't completed the flow, we want to always redirect them to the onboarding flow.
        // We also make sure that the user is authenticated.
        if (!NativeModules.HybridAppModule && !isOnboardingCompleted && authenticated && !shouldShowRequire2FAModal) {
            const {adaptedState} = getAdaptedStateFromPath(getOnboardingInitialPath(isPrivateDomain), linkingConfig.config);
            return adaptedState;
        }

        // If there is no lastVisitedPath, we can do early return. We won't modify the default behavior.
        // The same applies to HybridApp, as we always define the route to which we want to transition.
        if (!lastVisitedPath || NativeModules.HybridAppModule) {
            return undefined;
        }

        const path = initialUrl ? getPathFromURL(initialUrl) : null;

        // If the user opens the root of app "/" it will be parsed to empty string "".
        // If the path is defined and different that empty string we don't want to modify the default behavior.
        if (path) {
            return;
        }

        // Otherwise we want to redirect the user to the last visited path.
        const {adaptedState} = getAdaptedStateFromPath(lastVisitedPath, linkingConfig.config);
        return adaptedState;

        // The initialState value is relevant only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    // https://reactnavigation.org/docs/themes
    const navigationTheme = useMemo(() => {
        const defaultNavigationTheme = themePreference === CONST.THEME.DARK ? DarkTheme : DefaultTheme;

        return {
            ...defaultNavigationTheme,
            colors: {
                ...defaultNavigationTheme.colors,
                background: theme.appBG,
            },
        };
    }, [theme.appBG, themePreference]);

    useEffect(() => {
        if (firstRenderRef.current) {
            setupCustomAndroidBackHandler();

            // we don't want to make the report back button go back to LHN if the user
            // started on the small screen so we don't set it on the first render
            // making it only work on consecutive changes of the screen size
            firstRenderRef.current = false;
            return;
        }

        Navigation.setShouldPopAllStateOnUP(!shouldUseNarrowLayout);
    }, [shouldUseNarrowLayout]);

    const handleStateChange = (state: NavigationState | undefined) => {
        if (!state) {
            return;
        }
        const currentRoute = navigationRef.getCurrentRoute();
        Firebase.log(`[NAVIGATION] screen: ${currentRoute?.name}, params: ${JSON.stringify(currentRoute?.params ?? {})}`);

        const activeWorkspaceID = getPolicyIDFromState(state as NavigationState<RootStackParamList>);
        // Performance optimization to avoid context consumers to delay first render
        setTimeout(() => {
            currentReportIDValue?.updateCurrentReportID(state);
            setActiveWorkspaceID(activeWorkspaceID);
        }, 0);
        parseAndLogRoute(state);

        // We want to clean saved scroll offsets for screens that aren't anymore in the state.
        cleanStaleScrollOffsets(state);
    };

    return (
        <NavigationContainer
            initialState={initialState}
            onStateChange={handleStateChange}
            onReady={onReady}
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

NavigationRoot.displayName = 'NavigationRoot';

export default NavigationRoot;
