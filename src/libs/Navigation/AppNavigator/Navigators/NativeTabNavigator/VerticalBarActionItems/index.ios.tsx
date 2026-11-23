/**
 * The create and scan buttons as bar items of the screen that holds the tabs. On a foldable iPhone UIKit lays the items of
 * a navigation bar out in the vertical bar, next to the status items and the tab bar, and makes them fit whatever room
 * the bar has. The floating buttons would cover the content instead, so this component takes their place while the tab
 * bar is a column.
 */
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useWindowDimensions from '@hooks/useWindowDimensions';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';
import useCreateMenuVisibility from '@pages/inbox/sidebar/FABPopoverContent/useCreateMenuVisibility';
import useScanActions from '@pages/inbox/sidebar/FABPopoverContent/useScanActions';

import variables from '@styles/variables';

import type {ParamListBase} from '@react-navigation/native';
import type {NativeStackHeaderItem, NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import React, {useEffectEvent, useLayoutEffect, useRef} from 'react';

function VerticalBarActionItems() {
    // The tabs are the screen of the root stack, so this is the navigation of the screen whose bar items UIKit shows.
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {isCreateMenuVisible, hideCreateMenu, toggleCreateMenu} = useCreateMenuVisibility();
    const {startQuickScanFromCameraButton} = useScanActions();
    // Both get a new identity whenever the menu opens or closes or the data a scan starts from changes. Read through
    // effect events, a press runs the latest ones without the bar items being set again on each of those changes.
    const toggleMenu = useEffectEvent(toggleCreateMenu);
    const startScan = useEffectEvent(startQuickScanFromCameraButton);
    // The menu is docked to the bottom of a narrow layout, so it needs no button to line up with.
    const anchorRef = useRef<View>(null);
    const createLabel = translate('accessibilityHints.openActionsMenu');
    const scanLabel = translate('sidebarScreen.fabScanReceiptExplained');
    const scanItemColor = theme.success;
    // The fill of the floating create button. UIKit picks the color of a symbol on a filled item itself, so the plus is
    // not in the icon color as it is on the floating button.
    const createItemColor = theme.buttonDefaultBG;
    // UIKit gives every item a slot of a fixed size and never drops one, so in a bar too short for both it draws the second
    // over the tab bar. The create menu leads to a scan too, so its item is the one that stays.
    const shouldShowScanItem = windowHeight >= variables.iosVerticalBarTwoItemsMinHeight;

    useLayoutEffect(() => {
        navigation.setOptions({
            // UIKit only moves the items of a navigation bar that is shown. With no title the bar has nothing left to
            // draw along the top, and a transparent one takes no room from the screen.
            headerShown: true,
            headerTransparent: true,
            headerBackVisible: false,
            title: '',
            // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
            unstable_headerRightItems: () => {
                // Both icons are SF Symbols, which UIKit has at hand when it places the items. It puts an item with an icon
                // in the vertical bar and one with only a title in the top bar, and an image that loads later, such as
                // one from a `data:` URI, comes too late to move the item.
                const createItem: NativeStackHeaderItem = {
                    type: 'button',
                    label: createLabel,
                    icon: {type: 'sfSymbol', name: 'plus'},
                    variant: 'prominent',
                    tintColor: createItemColor,
                    sharesBackground: false,
                    onPress: () => toggleMenu(),
                };
                if (!shouldShowScanItem) {
                    return [createItem];
                }
                // UIKit stacks the items from the top of the bar, so scan goes over create as the floating buttons do.
                const scanItem: NativeStackHeaderItem = {
                    type: 'button',
                    label: scanLabel,
                    icon: {type: 'sfSymbol', name: 'camera.fill'},
                    variant: 'prominent',
                    tintColor: scanItemColor,
                    sharesBackground: false,
                    onPress: () => startScan(),
                };
                return [scanItem, createItem];
            },
        });
    }, [navigation, createLabel, createItemColor, scanLabel, scanItemColor, shouldShowScanItem]);

    // The floating buttons come back when the tab bar leaves the vertical bar or hides, so the bar items go then, and
    // with them everything the bar was given only to show them.
    useLayoutEffect(
        () => () =>
            navigation.setOptions({
                headerShown: false,
                headerTransparent: undefined,
                headerBackVisible: undefined,
                title: undefined,
                // eslint-disable-next-line @typescript-eslint/naming-convention -- React Navigation names the option this way.
                unstable_headerRightItems: undefined,
            }),
        [navigation],
    );

    return (
        <CreateMenuPopover
            isVisible={isCreateMenuVisible}
            onClose={hideCreateMenu}
            anchorRef={anchorRef}
        />
    );
}

export default VerticalBarActionItems;
