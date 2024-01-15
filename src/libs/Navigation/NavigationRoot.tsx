import type {NavigationState} from '@react-navigation/native';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef} from 'react';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useFlipper from '@hooks/useFlipper';
import useTheme from '@hooks/useTheme';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import {getPathFromURL} from '@libs/Url';
import {updateLastVisitedPath} from '@userActions/App';
import type {Route} from '@src/ROUTES';
import AppNavigator from './AppNavigator';
import customGetPathFromState from './customGetPathFromState';
import getPolicyIdFromState from './getPolicyIdFromState';
import getStateFromPath from './getStateFromPath';
import linkingConfig from './linkingConfig';
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

    const currentPath = customGetPathFromState(state, linkingConfig.config);
    updateLastVisitedPath(currentPath);

    // Don't log the route transitions from OldDot because they contain authTokens
    if (currentPath.includes('/transition')) {
        Log.info('Navigating from transition link from OldDot using short lived authToken');
    } else {
        Log.info('Navigating to route', false, {path: currentPath});
    }

    Navigation.setIsNavigationReady();
}

function NavigationRoot({authenticated, lastVisitedPath, initialUrl, onReady}: NavigationRootProps) {
    useFlipper(navigationRef);
    const firstRenderRef = useRef(true);
    const theme = useTheme();

    const currentReportIDValue = useCurrentReportID();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {setActiveWorkspaceID} = useActiveWorkspace();

    const initialState = useMemo(
        () => {
            if (!lastVisitedPath) {
                return undefined;
            }

            const path = initialUrl ? getPathFromURL(initialUrl) : null;

            // For non-nullable paths we don't want to set initial state
            if (path) {
                return;
            }

            return getStateFromPath(lastVisitedPath);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            // we don't want to make the report back button go back to LHN if the user
            // started on the small screen so we don't set it on the first render
            // making it only work on consecutive changes of the screen size
            firstRenderRef.current = false;
            return;
        }
        if (!isSmallScreenWidth) {
            return;
        }
        Navigation.setShouldPopAllStateOnUP();
    }, [isSmallScreenWidth]);

    const handleStateChange = (state: NavigationState | undefined) => {
        if (!state) {
            return;
        }
        const activeWorkspaceID = getPolicyIdFromState(state);
        // Performance optimization to avoid context consumers to delay first render
        setTimeout(() => {
            currentReportIDValue?.updateCurrentReportID(state);
            setActiveWorkspaceID(activeWorkspaceID);
        }, 0);
        parseAndLogRoute(state);
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
