import UserAvatar from '@components/Avatar/UserAvatar';
import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemLeading from '@components/MenuItem/layout/MenuItemLeading';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemDescription from '@components/MenuItem/leaves/text/description/MenuItemDescription';
import MenuItemTitle from '@components/MenuItem/leaves/text/MenuItemTitle';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type MenuItemAvatarNavigationProps = WithSentryLabel &
    WithTestID & {
        /** The title text of the row. Typically the name of whoever the avatar belongs to */
        title: string;

        /** Supporting line under the title — an email, address, or other secondary identifier */
        description: string;

        /** Account ID the avatar belongs to. Used to resolve `avatarSource` when it is a default-avatar URL */
        accountID: number;

        /** Avatar for the leading cell. Falls back to the generic fallback avatar when omitted */
        avatarSource?: AvatarSource;

        /** Function to fire when the row is pressed */
        onPress: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;
    };

/**
 * The avatar-navigation MenuItem preset — a tappable row led by a person's avatar, with their name as the title
 * and a secondary identifier below, that navigates.
 */
function MenuItemAvatarNavigation({title, description, accountID, avatarSource, onPress, isDisabled = false, sentryLabel, testID}: MenuItemAvatarNavigationProps) {
    return (
        <MenuItemRoot
            onPress={callFunctionIfActionIsAllowed(onPress)}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
            accessibilityLabel={[title, description].join(', ')}
        >
            <MenuItemRow>
                <MenuItemLeading>
                    <UserAvatar
                        source={avatarSource}
                        accountID={accountID}
                    />
                </MenuItemLeading>
                <MenuItemContent>
                    <MenuItemTitle>{title}</MenuItemTitle>
                    <MenuItemDescription>{description}</MenuItemDescription>
                </MenuItemContent>
                <MenuItemTrailing>
                    <MenuItemChevron />
                </MenuItemTrailing>
            </MenuItemRow>
        </MenuItemRoot>
    );
}

export default MenuItemAvatarNavigation;
