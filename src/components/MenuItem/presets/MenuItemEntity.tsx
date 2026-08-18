import UserAvatar from '@components/Avatar/UserAvatar';
import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemLeading from '@components/MenuItem/layout/MenuItemLeading';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemDescription from '@components/MenuItem/leaves/text/MenuItemDescription';
import MenuItemTitle from '@components/MenuItem/leaves/text/MenuItemTitle';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type MenuItemEntityProps = WithSentryLabel &
    WithTestID & {
        /** The entity's name, rendered as the row's title */
        title: string;

        /** Supporting line under the title — an email, address, or other secondary identifier */
        description: string;

        /** Account ID the avatar belongs to. Picks the default avatar when `avatarSource` is absent */
        accountID: number;

        /** The entity's avatar. Falls back to the default avatar for `accountID` when omitted */
        avatarSource?: AvatarSource;

        /** Function to fire when the row is pressed */
        onPress: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;
    };

/**
 * The entity MenuItem preset — a tappable row led by a person's avatar, with their name as the title
 * and a secondary identifier below, that navigates.
 */
function MenuItemEntity({title, description, accountID, avatarSource, onPress, isDisabled = false, sentryLabel, testID}: MenuItemEntityProps) {
    return (
        <MenuItemRoot
            onPress={callFunctionIfActionIsAllowed(onPress)}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
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

export default MenuItemEntity;
