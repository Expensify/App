import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemDescriptionPlaceholder from '@components/MenuItem/leaves/text/description/MenuItemDescriptionPlaceholder';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/icons/MenuItemChevron';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {PropsWithChildren} from 'react';
import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type MenuItemEmptyFieldProps = PropsWithChildren &
    WithSentryLabel &
    WithTestID & {
        /** Name of the field, standing in for the value the field does not have yet */
        description: string;

        /** Function to fire when the row is pressed */
        onPress: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;
    };

/** The empty-field MenuItem preset — a form field the user has not filled in yet */
function MenuItemEmptyField({description, onPress, children, isDisabled = false, sentryLabel, testID}: MenuItemEmptyFieldProps) {
    return (
        <MenuItemRoot
            onPress={callFunctionIfActionIsAllowed(onPress)}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
            accessibilityLabel={description}
        >
            <MenuItemRow>
                <MenuItemContent>
                    <MenuItemDescriptionPlaceholder>{description}</MenuItemDescriptionPlaceholder>
                </MenuItemContent>
                <MenuItemTrailing>
                    {children}
                    <MenuItemChevron />
                </MenuItemTrailing>
            </MenuItemRow>
        </MenuItemRoot>
    );
}

export default MenuItemEmptyField;
