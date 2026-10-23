import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import {useIsFocused} from '@react-navigation/native';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import {SafeAreaListener} from 'react-native-safe-area-context';

const TabBarShapeContext = createContext<(isTabBarVertical: boolean) => void>(() => {});

type TabBarShapeProbeProps = {
    /** Whether the native tab bar is shown, so its shape is only read while it adds to the safe area */
    isTabBarShown: boolean;
};

/**
 * UIKit adds the area of the tab bar to the safe area of each tab screen, and a SafeAreaListener reports the insets of
 * the view it is in, unlike the app root's, which measures the window. A bar along the bottom adds its height to the
 * bottom inset; a bar laid out as a column sits in the side inset and adds nothing.
 */
function TabBarShapeProbe({isTabBarShown}: TabBarShapeProbeProps) {
    const styles = useThemeStyles();
    const setIsTabBarVertical = useContext(TabBarShapeContext);
    const {bottom: windowBottomInset} = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const [tabScreenBottomInset, setTabScreenBottomInset] = useState<number>();

    useEffect(() => {
        // A hidden bar adds nothing to the safe area whatever its shape, so the shape is only read while the bar shows.
        if (!isFocused || !isTabBarShown || tabScreenBottomInset === undefined) {
            return;
        }
        setIsTabBarVertical(tabScreenBottomInset === windowBottomInset);
    }, [isFocused, isTabBarShown, setIsTabBarVertical, tabScreenBottomInset, windowBottomInset]);

    return (
        // The Android SafeAreaListener ignores pointerEvents, so the View is what lets touches through to the tab screen.
        <View
            style={styles.fullScreen}
            pointerEvents="none"
        >
            <SafeAreaListener onChange={({insets}) => setTabScreenBottomInset(insets.bottom)} />
        </View>
    );
}

export default TabBarShapeProbe;
export {TabBarShapeContext};
