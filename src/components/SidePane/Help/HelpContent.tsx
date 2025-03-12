import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getHelpContent from '@components/SidePane/getHelpContent';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePane from '@hooks/useSidePane';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {substituteRouteParameters} from '@libs/SidePaneUtils';

function HelpContent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {closeSidePane} = useSidePane();
    const route = useRootNavigationState((state) => {
        const params = (findFocusedRoute(state)?.params as Record<string, string>) ?? {};
        const activeRoute = Navigation.getActiveRouteWithoutParams();
        return substituteRouteParameters(activeRoute, params);
    });

    const sizeChangedFromLargeToNarrow = useRef(!isExtraLargeScreenWidth);
    useEffect(() => {
        // Close the side pane when the screen size changes from large to small
        if (!isExtraLargeScreenWidth && !sizeChangedFromLargeToNarrow.current) {
            closeSidePane(true);
            sizeChangedFromLargeToNarrow.current = true;
        }

        // Reset the trigger when the screen size changes back to large
        if (isExtraLargeScreenWidth) {
            sizeChangedFromLargeToNarrow.current = false;
        }
    }, [isExtraLargeScreenWidth, closeSidePane]);

    return (
        <>
            <HeaderGap />
            <HeaderWithBackButton
                title={translate('common.help')}
                style={styles.headerBarDesktopHeight}
                onBackButtonPress={() => closeSidePane(false)}
                onCloseButtonPress={() => closeSidePane(false)}
                shouldShowBackButton={!isExtraLargeScreenWidth}
                shouldShowCloseButton={isExtraLargeScreenWidth}
                shouldDisplayHelpButton={false}
            />
            {getHelpContent(styles, route, isProduction)}
        </>
    );
}

HelpContent.displayName = 'HelpContent';

export default HelpContent;
