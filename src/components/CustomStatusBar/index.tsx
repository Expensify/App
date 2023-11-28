import {EventListenerCallback, NavigationContainerEventMap} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect} from 'react';
import {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import useTheme from '@styles/themes/useTheme';
import CustomStatusBarContext from './CustomStatusBarContext';

type CustomStatusBarProps = {
    isNested: boolean;
};

const propTypes = {
    isNested: PropTypes.bool,
};

type CustomStatusBarType = {
    (props: CustomStatusBarProps): React.ReactNode;
    displayName: string;
    propTypes: typeof propTypes;
};

// eslint-disable-next-line react/function-component-definition
const CustomStatusBar: CustomStatusBarType = ({isNested = false}) => {
    const {isRootStatusBarDisabled, disableRootStatusBar} = useContext(CustomStatusBarContext);
    const theme = useTheme();

    const isDisabled = !isNested && isRootStatusBarDisabled;

    useEffect(() => {
        if (isNested) {
            disableRootStatusBar(true);
        }

        return () => disableRootStatusBar(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigationStateListener = useCallback<EventListenerCallback<NavigationContainerEventMap, 'state'>>(() => {
        if (isDisabled) {
            return;
        }

        // Set the status bar colour depending on the current route.
        // If we don't have any colour defined for a route, fall back to
        // appBG color.
        const currentRoute = navigationRef.getCurrentRoute();

        let currentScreenBackgroundColor = theme.appBG;
        let statusBarStyle;
        if (currentRoute && 'name' in currentRoute && currentRoute.name in theme.PAGE_THEMES) {
            const screenTheme = theme.PAGE_THEMES[currentRoute.name];
            currentScreenBackgroundColor = screenTheme.backgroundColor;
            statusBarStyle = screenTheme.statusBarStyle;
        }

        StatusBar.setBackgroundColor(currentScreenBackgroundColor, true);
        if (statusBarStyle != null) {
            StatusBar.setBarStyle(statusBarStyle, true);
        }
    }, [isDisabled, theme.PAGE_THEMES, theme.appBG]);

    useEffect(() => {
        navigationRef.addListener('state', navigationStateListener);

        return () => navigationRef.removeListener('state', navigationStateListener);
    }, [navigationStateListener]);

    useEffect(() => {
        StatusBar.setBarStyle(theme.statusBarStyle, true);
    }, [theme.statusBarStyle]);

    if (isDisabled) {
        return null;
    }

    return <StatusBar />;
};

CustomStatusBar.displayName = 'CustomStatusBar';
CustomStatusBar.propTypes = propTypes;

export default CustomStatusBar;
