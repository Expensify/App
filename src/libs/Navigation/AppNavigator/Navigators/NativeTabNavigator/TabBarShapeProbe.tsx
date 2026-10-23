import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import {useIsFocused} from '@react-navigation/native';
import React, {createContext, useContext, useEffect} from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const TabBarShapeContext = createContext<(isTabBarVertical: boolean) => void>(() => {});

function TabScreenInsetsReader({windowBottomInset, isTabBarShown}: {windowBottomInset: number; isTabBarShown: boolean}) {
    const setIsTabBarVertical = useContext(TabBarShapeContext);
    // Read under the probe's own SafeAreaProvider, so these are the tab screen's insets.
    const {bottom: tabScreenBottomInset} = useSafeAreaInsets();
    const isFocused = useIsFocused();

    useEffect(() => {
        // A hidden bar adds nothing to the safe area whatever its shape, so the shape is only read while the bar shows.
        if (!isFocused || !isTabBarShown) {
            return;
        }
        setIsTabBarVertical(tabScreenBottomInset === windowBottomInset);
    }, [isFocused, isTabBarShown, setIsTabBarVertical, tabScreenBottomInset, windowBottomInset]);

    return null;
}

type TabBarShapeProbeProps = {
    /** Whether the native tab bar is shown, so its shape is only read while it adds to the safe area */
    isTabBarShown: boolean;
};

/**
 * UIKit adds the area of the tab bar to the safe area of each tab screen, and a SafeAreaProvider measures the view it is
 * in, unlike the app root's, which measures the window. A bar along the bottom adds its height to the bottom inset; a bar
 * laid out as a column sits in the side inset and adds nothing.
 */
function TabBarShapeProbe({isTabBarShown}: TabBarShapeProbeProps) {
    const styles = useThemeStyles();
    const {bottom: windowBottomInset} = useSafeAreaInsets();

    return (
        <View
            style={styles.fullScreen}
            pointerEvents="none"
        >
            <SafeAreaProvider>
                <TabScreenInsetsReader
                    windowBottomInset={windowBottomInset}
                    isTabBarShown={isTabBarShown}
                />
            </SafeAreaProvider>
        </View>
    );
}

export default TabBarShapeProbe;
export {TabBarShapeContext};
