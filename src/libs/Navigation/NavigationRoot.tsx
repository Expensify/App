import type {NavigationState} from '@react-navigation/native';
import {DefaultTheme, findFocusedRoute, NavigationContainer} from '@react-navigation/native';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import HybridAppMiddleware from '@components/HybridAppMiddleware';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useTheme from '@hooks/useTheme';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {FSPage} from '@libs/Fullstory';
import Log from '@libs/Log';
import {getPathFromURL} from '@libs/Url';
import {updateLastVisitedPath} from '@userActions/App';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
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

function NavigationRoot({authenticated, lastVisitedPath, initialUrl, onReady}: NavigationRootProps) {
    const firstRenderRef = useRef(true);
    const theme = useTheme();
    const {cleanStaleScrollOffsets} = useContext(ScrollOffsetContext);

    const currentReportIDValue = useCurrentReportID();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {setActiveWorkspaceID} = useActiveWorkspace();

<<<<<<< HEAD
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });
    const [user] = useOnyx(ONYXKEYS.USER);

    const initialState = useMemo(() => {
        if (!user || user.isFromPublicDomain) {
            return;
        }
        // If the user haven't completed the flow, we want to always redirect them to the onboarding flow.
        if (!hasCompletedGuidedSetupFlow) {
            const {adaptedState} = getAdaptedStateFromPath(ROUTES.ONBOARDING_ROOT, linkingConfig.config);

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    // https://reactnavigation.org/docs/themes
    const navigationTheme = useMemo(
        () => ({
            ...DefaultTheme,
            colors: {
                ...DefaultTheme.colors,
                background: theme.appBG,
            },
        }),
        [theme],
    );

    useEffect(() => {
        if (firstRenderRef.current) {
            setupCustomAndroidBackHandler();

            // we don't want to make the report back button go back to LHN if the user
            // started on the small screen so we don't set it on the first render
            // making it only work on consecutive changes of the screen size
            firstRenderRef.current = false;
            return;
        }

        Navigation.setShouldPopAllStateOnUP(!isSmallScreenWidth);
    }, [isSmallScreenWidth]);

    const handleStateChange = (state: NavigationState | undefined) => {
        if (!state) {
            return;
        }
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
            {/* HybridAppMiddleware needs to have access to navigation ref and SplashScreenHidden context */}
            <HybridAppMiddleware authenticated={authenticated}>
                <AppNavigator authenticated={authenticated} />
            </HybridAppMiddleware>
        </NavigationContainer>
    );
}

NavigationRoot.displayName = 'NavigationRoot';

export default NavigationRoot;
