import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';
import MenuItemRightLabel from '@components/MenuItem/leaves/trailing/MenuItemRightLabel';

import useLocalize from '@hooks/useLocalize';

import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {PropsWithChildren} from 'react';
import type {GestureResponderEvent} from 'react-native';

import React from 'react';

import MenuItemEmptyField from './MenuItemEmptyField';
import MenuItemWithLabel from './MenuItemWithLabel';

type MenuItemFieldProps = PropsWithChildren &
    WithSentryLabel &
    WithTestID & {
        /** Name of the field. Placeholder for the value while the field is empty, and moves up into the label once it has one */
        label: string;

        /** The picked value */
        value?: string;

        /** Whether to show the `Required` hint. Only reaches the screen while the field is empty, since a filled field cannot be missing */
        isRequired?: boolean;

        /** Function to fire when the row is pressed. Omit to drop the chevron */
        onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;
    };

/** The field MenuItem preset — a form field whose value the user picks on another screen */
function MenuItemField({label, value, isRequired = false, onPress, isDisabled = false, sentryLabel, testID, children}: MenuItemFieldProps) {
    const {translate} = useLocalize();

    if (!value && !!onPress) {
        return (
            <MenuItemEmptyField
                description={label}
                onPress={onPress}
                isDisabled={isDisabled}
                sentryLabel={sentryLabel}
                testID={testID}
            >
                {isRequired && <MenuItemRightLabel>{translate('common.required')}</MenuItemRightLabel>}
            </MenuItemEmptyField>
        );
    }

    return (
        <MenuItemWithLabel
            label={label}
            onPress={onPress}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
        >
            <MenuItemRow>
                {children}
                {!!onPress && (
                    <MenuItemTrailing>
                        <MenuItemChevron />
                    </MenuItemTrailing>
                )}
            </MenuItemRow>
        </MenuItemWithLabel>
    );
}

export default MenuItemField;
