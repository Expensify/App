import FloatingCameraButton from '@components/FloatingCameraButton';

import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {hasVerticalBarBackButton, showVerticalBarHost, subscribeToVerticalBarBackButtons} from '@libs/Navigation/verticalBarHost';

import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';

import variables from '@styles/variables';

import type {ParamListBase} from '@react-navigation/native';
import type {NativeStackHeaderItem, NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect, useSyncExternalStore} from 'react';
import {View} from 'react-native';

/**
 * The create and scan buttons as bar items of the screen that holds the tabs. On a foldable iPhone UIKit lays the items of
 * a navigation bar out in the vertical bar, next to the status items and the tab bar. The floating buttons would cover
 * the content instead, so this component moves them there while the tab bar is a column.
 */
function VerticalBarActionItems() {
    // The tabs are the screen of the root stack, so this is the navigation of the screen whose bar items UIKit shows.
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    // UIKit sizes the slot of an item after the item's view and pads it above and below, which would leave the buttons
    // further apart than they float. The view is shorter than its button by that padding, and the button, centered in
    // it, covers the padding, so the gap UIKit keeps between two slots is the one left between the buttons.
    const itemSizeStyle = StyleUtils.getWidthAndHeightStyle(variables.componentSizeLarge, variables.componentSizeLarge - 2 * variables.iosVerticalBarItemViewPadding);
    // UIKit never drops an item, so in a bar too short for all of them it draws the last over the tab bar. The bar of a
    // phone folded in landscape has room for one item above the tab bar. The create button is the one that stays, as an
    // expense created from its menu can start with a scan too.
    const hasRoomForScanItem = windowHeight >= variables.iosVerticalBarSeveralItemsMinHeight;
    // The back button of the tab screen that is shown takes the place of the buttons in the vertical bar.
    const getHasBackButton = () => hasVerticalBarBackButton(navigation);
    const hasBackButton = useSyncExternalStore(subscribeToVerticalBarBackButtons, getHasBackButton, getHasBackButton);

    // UIKit only moves the items of a navigation bar that is shown. The buttons float again when the tab bar leaves the
    // vertical bar or hides, so they need the bar no longer then.
    useLayoutEffect(() => showVerticalBarHost(navigation), [navigation]);

    useLayoutEffect(() => {
        if (hasBackButton) {
            return;
        }
        // The items are the floating buttons themselves, so they look and react to a press as they do over the content.
        // The buttons bring their own glass, so UIKit adds none behind them.
        const createItem: NativeStackHeaderItem = {
            type: 'custom',
            element: (
                <View style={itemSizeStyle}>
                    <NavigationTabBarFloatingActionButton />
                </View>
            ),
            hidesSharedBackground: true,
        };
        const scanItem: NativeStackHeaderItem = {
            type: 'custom',
            element: <FloatingCameraButton style={itemSizeStyle} />,
            hidesSharedBackground: true,
        };
        // UIKit stacks the items from the top of the bar, so scan goes over create as it does when they float.
        const items = hasRoomForScanItem ? [scanItem, createItem] : [createItem];
        // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
        navigation.setOptions({unstable_headerRightItems: () => items});
        // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
        return () => navigation.setOptions({unstable_headerRightItems: undefined});
    }, [navigation, itemSizeStyle, hasRoomForScanItem, hasBackButton]);

    return null;
}

export default VerticalBarActionItems;
