import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemDescription from '@components/MenuItem/leaves/text/description/MenuItemDescription';
import MenuItemTitleBasic from '@components/MenuItem/leaves/text/title/MenuItemTitleBasic';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

type MenuItemFieldProps = WithSentryLabel &
    WithTestID & {
        /** Name of the field, sitting above the value it holds */
        description: string;

        /** The value the field holds */
        title: string;

        /** Function to fire when the row is pressed. Its presence is what makes the row editable, and what adds the chevron */
        onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;
    };

/**
 * The field MenuItem preset — a filled-in form field: the name of the field on top, the value the
 * user picked below it. Pair it with `MenuItemEmptyField` for the branch where there is no value yet.
 */
function MenuItemField({description, title, onPress, isDisabled = false, sentryLabel, testID}: MenuItemFieldProps) {
    return (
        <MenuItemRoot
            onPress={onPress ? callFunctionIfActionIsAllowed(onPress) : undefined}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
            accessibilityLabel={[description, title].join(', ')}
        >
            <MenuItemRow>
                <MenuItemContent>
                    <MenuItemDescription>{description}</MenuItemDescription>
                    <MenuItemTitleBasic>{title}</MenuItemTitleBasic>
                </MenuItemContent>
                {!!onPress && (
                    <MenuItemTrailing>
                        <MenuItemChevron />
                    </MenuItemTrailing>
                )}
            </MenuItemRow>
        </MenuItemRoot>
    );
}

export default MenuItemField;
