import {findFocusedRoute} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScrollView from '@components/ScrollView';
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

    const wasPreviousNarrowScreen = useRef(!isExtraLargeScreenWidth);
    useEffect(() => {
        // Close the side pane when the screen size changes from large to small
        if (!isExtraLargeScreenWidth && !wasPreviousNarrowScreen.current) {
            closeSidePane(true);
            wasPreviousNarrowScreen.current = true;
        }

        // Reset the trigger when the screen size changes back to large
        if (isExtraLargeScreenWidth) {
            wasPreviousNarrowScreen.current = false;
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
            <ScrollView style={[styles.ph5, styles.pb5]}>{getHelpContent(styles, route, isProduction)}</ScrollView>
        </>
    );
}

HelpContent.displayName = 'HelpContent';

export default HelpContent;
