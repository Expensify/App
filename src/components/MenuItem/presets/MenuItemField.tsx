import MenuItemContent from '@components/MenuItem/layout/MenuItemContent';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
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

    /** Value the field holds. Omit it — or pass an empty string — for a field not filled in yet */
    value?: string;
};

/** Field preset — a field name plus its value; with no `value` the name takes over the row */
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
