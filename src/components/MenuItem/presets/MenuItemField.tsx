import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemFieldName from '@components/MenuItem/leaves/text/MenuItemFieldName';
import MenuItemFieldNamePlaceholder from '@components/MenuItem/leaves/text/MenuItemFieldNamePlaceholder';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import React, {Children} from 'react';

type MenuItemFieldProps = Omit<MenuItemRootProps, 'accessibilityLabel'> & {
    /** Name of the field. Sits above the value when the field has one, stands in for it when it does not */
    name: string;
};

/**
 * The field MenuItem preset — a form field: the name of the field, and the value the user picked for
 * it. Pass the value as a child (`MenuItem.FieldValue` in most cases) and leave the child out for the
 * branch where there is no value yet — the field name then takes over the row on its own.
 */
function MenuItemField({name, children, onPress, isDisabled = false, sentryLabel, testID}: MenuItemFieldProps) {
    // `Children.toArray` drops the `false` a `{!!value && <MenuItem.FieldValue>}` child leaves behind
    const hasValue = Children.toArray(children).length > 0;

    return (
        <MenuItemRoot
            onPress={onPress ? callFunctionIfActionIsAllowed(onPress) : undefined}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
        >
            <MenuItemRow>
                <MenuItemContent>
                    {hasValue ? (
                        <>
                            <MenuItemFieldName>{name}</MenuItemFieldName>
                            {children}
                        </>
                    ) : (
                        <MenuItemFieldNamePlaceholder>{name}</MenuItemFieldNamePlaceholder>
                    )}
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
