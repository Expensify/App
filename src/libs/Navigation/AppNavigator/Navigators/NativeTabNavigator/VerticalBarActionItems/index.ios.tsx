import FloatingCameraButton from '@components/FloatingCameraButton';

import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {setVerticalBarActionItems} from '@libs/Navigation/verticalBarHost';

import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';

import variables from '@styles/variables';

import type {ParamListBase} from '@react-navigation/native';
import type {NativeStackHeaderItem, NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect} from 'react';
import {View} from 'react-native';

/**
 * The create and scan buttons as bar items of the screen that holds the tabs. On a foldable iPhone UIKit lays the items of
 * a navigation bar out in the vertical bar, next to the status items and the tab bar. The floating buttons would cover
 * the content instead, so this component moves them there while the tab bar is a column.
 */
function VerticalBarActionItems() {
    // This renders inside the tab navigator, so it gets the navigation of the root stack screen that holds the tabs.
    // The bar items go on that screen's native bar, the one UIKit moves into the vertical bar.
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    // UIKit never drops an item, so in a bar too short for all of them it draws the last over the tab bar. The bar of a
    // phone folded in landscape has room for one item above the tab bar. The create button is the one that stays.
    const hasRoomForScanItem = windowHeight >= variables.iosVerticalBarSeveralItemsMinHeight;

    useLayoutEffect(() => {
        // The items are the floating buttons themselves, so they look and react to a press as they do over the content.
        // The buttons bring their own glass, so UIKit adds none behind them.
        const createItem: NativeStackHeaderItem = {
            type: 'custom',
            element: (
                <View style={styles.verticalBarItem}>
                    <NavigationTabBarFloatingActionButton />
                </View>
            ),
            hidesSharedBackground: true,
        };
        const scanItem: NativeStackHeaderItem = {
            type: 'custom',
            element: <FloatingCameraButton style={styles.verticalBarItem} />,
            hidesSharedBackground: true,
        };
        // UIKit stacks the items from the top of the bar, so scan goes over create as it does when they float.
        setVerticalBarActionItems(navigation, hasRoomForScanItem ? [scanItem, createItem] : [createItem]);
        // This unmounts when the tab bar stops being a column or hides, and the floating buttons take over then.
        return () => setVerticalBarActionItems(navigation, undefined);
    }, [navigation, styles.verticalBarItem, hasRoomForScanItem]);

    return null;
}

export default VerticalBarActionItems;
