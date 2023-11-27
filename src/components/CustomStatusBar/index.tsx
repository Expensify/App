import React, {useContext, useEffect, useMemo} from 'react';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import StatusBar from '@libs/StatusBar';
import useTheme from '@styles/themes/useTheme';
import CONST from '@src/CONST';
import CustomStatusBarContext from './CustomStatusBarContext';

type CustomStatusBarProps = {
    isNested: boolean;
};

function CustomStatusBar({isNested = false}: CustomStatusBarProps): React.ReactElement | null {
    const {isRootStatusBarDisabled, disableRootStatusBar} = useContext(CustomStatusBarContext);
    const theme = useTheme();
    const statusBarContentTheme = useMemo(
        () => (theme.statusBarContentTheme === CONST.STATUS_BAR_AND_SCROLLBAR_THEME.LIGHT ? CONST.STATUS_BAR_THEME.LIGHT_CONTENT : CONST.STATUS_BAR_THEME.DARK_CONTENT),
        [theme.statusBarContentTheme],
    );

    const isDisabled = !isNested && isRootStatusBarDisabled;

    useEffect(() => {
        if (isNested) {
            disableRootStatusBar(true);
        }

        return () => disableRootStatusBar(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isDisabled) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            // Set the status bar colour depending on the current route.
            // If we don't have any colour defined for a route, fall back to
            // appBG color.
            const currentRoute = navigationRef.getCurrentRoute();
            let currentScreenBackgroundColor = theme.appBG;
            if (currentRoute && 'name' in currentRoute && currentRoute.name in theme.PAGE_BACKGROUND_COLORS) {
                currentScreenBackgroundColor = theme.PAGE_BACKGROUND_COLORS[currentRoute.name];
            }
            StatusBar.setBarStyle(statusBarContentTheme, true);
            StatusBar.setBackgroundColor(currentScreenBackgroundColor);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme.PAGE_BACKGROUND_COLORS, theme.appBG]);

    useEffect(() => {
        StatusBar.setBarStyle(statusBarContentTheme, true);
    }, [statusBarContentTheme]);

    if (isDisabled) {
        return null;
    }

    return <StatusBar />;
}

CustomStatusBar.displayName = 'CustomStatusBar';

export default CustomStatusBar;
