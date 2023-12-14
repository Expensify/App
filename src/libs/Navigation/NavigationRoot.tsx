import {DefaultTheme, getPathFromState, NavigationContainer, NavigationState} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useFlipper from '@hooks/useFlipper';
import useTheme from '@hooks/useTheme';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import AppNavigator from './AppNavigator';
import linkingConfig from './linkingConfig';
import Navigation, {navigationRef} from './Navigation';

type NavigationRootProps = {
    /** Whether the current user is logged in with an authToken */
    authenticated: boolean;

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

    // Don't log the route transitions from OldDot because they contain authTokens
    if (currentPath.includes('/transition')) {
        Log.info('Navigating from transition link from OldDot using short lived authToken');
    } else {
        Log.info('Navigating to route', false, {path: currentPath});
    }

    Navigation.setIsNavigationReady();
}

function NavigationRoot({authenticated, onReady}: NavigationRootProps) {
    useFlipper(navigationRef);
    const firstRenderRef = useRef(true);
    const theme = useTheme();

    const currentReportIDValue = useCurrentReportID();
    const {isSmallScreenWidth} = useWindowDimensions();

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

    useEffect(() => {
        if (!navigationRef.isReady() || !authenticated) {
            return;
        }
        // We need to force state rehydration so the CustomRouter can add the CentralPaneNavigator route if necessary.
        navigationRef.resetRoot(navigationRef.getRootState());
    }, [isSmallScreenWidth, authenticated]);

    const handleStateChange = (state: NavigationState | undefined) => {
        if (!state) {
            return;
        }

        // Performance optimization to avoid context consumers to delay first render
        setTimeout(() => {
            currentReportIDValue?.updateCurrentReportID(state);
        }, 0);
        parseAndLogRoute(state);
    };

    return (
        <NavigationContainer
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
