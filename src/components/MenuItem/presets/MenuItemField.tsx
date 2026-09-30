import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemFieldName from '@components/MenuItem/leaves/content/MenuItemFieldName';
import MenuItemFieldNamePlaceholder from '@components/MenuItem/leaves/content/MenuItemFieldNamePlaceholder';
import MenuItemFieldValue from '@components/MenuItem/leaves/content/MenuItemFieldValue';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/icons/MenuItemChevron';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type {PropsWithChildren, ReactNode} from 'react';

import React from 'react';

type MenuItemFieldRowProps = PropsWithChildren<{
    /** Name of the field */
    name: string;

    /** Value the field holds. Omit it, or pass an empty string, for a field not filled in yet */
    value?: string;

    /** How many lines the value may take. Defaults to 1, and `0` lets it grow unbounded */
    numberOfLinesValue?: number;
}>;

type MenuItemFieldProps = Omit<MenuItemRootProps, 'accessibilityLabel'> & Omit<MenuItemFieldRowProps, 'children'>;

type MenuItemFieldContentProps = {
    /** Name of the field */
    name: string;

    /** The value leaf, e.g. `MenuItem.FieldValue` or `MenuItem.FieldValueHTML`. Leave it out for a field not filled in yet */
    children?: ReactNode;
};

/**
 * The content cell of a field: its name over its value, or the name alone standing in for a missing value.
 * Reach for it when the value needs a leaf other than `MenuItem.FieldValue`.
 */
function MenuItemFieldContent({name, children}: MenuItemFieldContentProps) {
    return (
        <MenuItemContent>
            {children ? (
                <>
                    <MenuItemFieldName>{name}</MenuItemFieldName>
                    {children}
                </>
            ) : (
                <MenuItemFieldNamePlaceholder>{name}</MenuItemFieldNamePlaceholder>
            )}
        </MenuItemContent>
    );
}

/**
 * The line a field preset draws, without a `MenuItem.Root` of its own. Reach for it over the
 * `MenuItemField` preset when the row needs siblings inside the same `Root` (an error or a hint
 * line under the row).
 */
function MenuItemFieldRow({name, value, numberOfLinesValue, children}: MenuItemFieldRowProps) {
    return (
        <MenuItemRow>
            <MenuItemFieldContent name={name}>{!!value && <MenuItemFieldValue numberOfLines={numberOfLinesValue}>{value}</MenuItemFieldValue>}</MenuItemFieldContent>
            {!!children && <MenuItemTrailing>{children}</MenuItemTrailing>}
        </MenuItemRow>
    );
}

/**
 * Field preset: a field name plus its value. With no `value` the name takes over the row.
 * `children` land in the trailing cell, next to the chevron.
 */
function MenuItemFieldPreset({name, value, numberOfLinesValue, children, onPress, isDisabled = false, sentryLabel, testID}: MenuItemFieldProps) {
    return (
        <MenuItemRoot
            onPress={onPress ? callFunctionIfActionIsAllowed(onPress) : undefined}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
        >
            <MenuItemFieldRow
                name={name}
                value={value}
                numberOfLinesValue={numberOfLinesValue}
            >
                {(!!children || !!onPress) && (
                    <>
                        {children}
                        {!!onPress && <MenuItemChevron />}
                    </>
                )}
            </MenuItemFieldRow>
        </MenuItemRoot>
    );
}

const MenuItemField = Object.assign(MenuItemFieldPreset, {Row: MenuItemFieldRow, Content: MenuItemFieldContent});

export default MenuItemField;
