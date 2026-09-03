import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemFieldName from '@components/MenuItem/leaves/content/MenuItemFieldName';
import MenuItemFieldNamePlaceholder from '@components/MenuItem/leaves/content/MenuItemFieldNamePlaceholder';
import MenuItemFieldValue from '@components/MenuItem/leaves/content/MenuItemFieldValue';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import React from 'react';

type MenuItemFieldProps = Omit<MenuItemRootProps, 'accessibilityLabel'> & {
    /** Name of the field */
    name: string;

    /** Value the field holds. Leave it out — or pass an empty string — for a field the user has not filled in yet */
    value?: string;
};

/**
 * The field MenuItem preset — a form field: the name of the field, and the value the user picked for
 * it. With no `value` the field name takes over the row at value size, so an unfilled row keeps its
 * height and weight in a list of filled ones.
 *
 * `value` is the only prop allowed to branch here. Anything else a field row needs goes in
 * `children`: trailing leaves, rendered before the chevron — a `MenuItem.RightLabel`, and later a
 * badge or an error indicator. That slot is how this preset grows, never a new prop.
 *
 * Reach past the preset for the shapes it deliberately does not cover — a field with a leading icon,
 * a label above the row, or a value that is an element rather than a string. Those compose from
 * `MenuItem.Root` / `Row` / `Content` around the `MenuItem.FieldName` / `MenuItem.FieldValue` /
 * `MenuItem.FieldNamePlaceholder` leaves.
 */
function MenuItemField({name, value, children, onPress, isDisabled = false, sentryLabel, testID}: MenuItemFieldProps) {
    return (
        <MenuItemRoot
            onPress={onPress ? callFunctionIfActionIsAllowed(onPress) : undefined}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
        >
            <MenuItemRow>
                <MenuItemContent>
                    {value ? (
                        <>
                            <MenuItemFieldName>{name}</MenuItemFieldName>
                            <MenuItemFieldValue>{value}</MenuItemFieldValue>
                        </>
                    ) : (
                        <MenuItemFieldNamePlaceholder>{name}</MenuItemFieldNamePlaceholder>
                    )}
                </MenuItemContent>
                {(!!children || !!onPress) && (
                    <MenuItemTrailing>
                        {children}
                        {!!onPress && <MenuItemChevron />}
                    </MenuItemTrailing>
                )}
            </MenuItemRow>
        </MenuItemRoot>
    );
}

export default MenuItemField;
export type {MenuItemFieldProps};
