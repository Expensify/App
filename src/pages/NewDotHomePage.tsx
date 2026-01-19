import React from 'react';
import {View} from 'react-native';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ScreenWrapper from '@components/ScreenWrapper';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

function NewDotHomePage() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="NewDotHomePage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={
                shouldUseNarrowLayout && (
                    <NavigationTabBar
                        selectedTab={NAVIGATION_TABS.NEW_DOT_HOME}
                        shouldShowFloatingCameraButton
                    />
                )
            }
        >
            <View style={styles.flex1} />
        </ScreenWrapper>
    );
}

export default NewDotHomePage;
