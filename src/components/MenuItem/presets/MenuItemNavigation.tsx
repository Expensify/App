import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemLeading from '@components/MenuItem/layout/MenuItemLeading';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemIcon from '@components/MenuItem/leaves/leading/MenuItemIcon';
import MenuItemTitle from '@components/MenuItem/leaves/text/MenuItemTitle';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/icons/MenuItemChevron';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type MenuItemNavigationProps = WithSentryLabel &
    WithTestID & {
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
function MenuItemNavigation({title, icon, onPress, isDisabled = false, sentryLabel, testID}: MenuItemNavigationProps) {
    return (
        <MenuItemRoot
            onPress={callFunctionIfActionIsAllowed(onPress)}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
            accessibilityLabel={title}
        >
            <MenuItemRow>
                <MenuItemLeading>
                    <MenuItemIcon src={icon} />
                </MenuItemLeading>
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
