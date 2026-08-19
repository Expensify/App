import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemIcon from '@components/MenuItem/leaves/leading/MenuItemIcon';
import MenuItemTitle from '@components/MenuItem/leaves/text/MenuItemTitle';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type MenuItemNavigationProps = WithSentryLabel & {
    /** The title text of the row */
    title: string;

    /** Leading icon to display */
    icon: IconAsset;

    /** Function to fire when the row is pressed */
    onPress: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    /** Whether the menu item is disabled */
    isDisabled?: boolean;
};

/**
 * The navigation MenuItem preset — a tappable row with a leading icon, a title, and a trailing
 * chevron signaling that pressing it takes the user somewhere else
 */
function MenuItemNavigation({title, icon, onPress, isDisabled = false, sentryLabel}: MenuItemNavigationProps) {
    return (
        <MenuItemRoot
            onPress={callFunctionIfActionIsAllowed(onPress)}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            accessibilityLabel={title}
        >
            <MenuItemRow>
                <MenuItemIcon src={icon} />
                <MenuItemContent>
                    <MenuItemTitle>{title}</MenuItemTitle>
                </MenuItemContent>
                <MenuItemTrailing>
                    <MenuItemChevron />
                </MenuItemTrailing>
            </MenuItemRow>
        </MenuItemRoot>
    );
}

export default MenuItemNavigation;
