import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemFieldValueHTML from '@components/MenuItem/leaves/content/MenuItemFieldValueHTML';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/icons/MenuItemChevron';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type {PropsWithChildren} from 'react';

import React from 'react';

import MenuItemField from './MenuItemField';

type MenuItemFieldHTMLProps = Omit<MenuItemRootProps, 'accessibilityLabel'> &
    PropsWithChildren<{
        /** Name of the field */
        name: string;

        /** HTML the field holds. Markdown has to be turned into HTML by the caller first, e.g. with `Parser.replace` */
        value?: string;

        /** Cuts the rendered value down to this many characters, closing any tags left open */
        characterLimit?: number;
    }>;

/**
 * Field preset with its value given as HTML: a field name plus its rendered value. With no `value` the name takes over the row.
 * `children` land in the trailing cell, next to the chevron.
 */
function MenuItemFieldHTML({name, value, characterLimit, children, onPress, isDisabled = false, sentryLabel, testID}: MenuItemFieldHTMLProps) {
    return (
        <MenuItemRoot
            onPress={onPress ? callFunctionIfActionIsAllowed(onPress) : undefined}
            isDisabled={isDisabled}
            sentryLabel={sentryLabel}
            testID={testID}
        >
            <MenuItemRow>
                <MenuItemField.Content name={name}>{!!value && <MenuItemFieldValueHTML characterLimit={characterLimit}>{value}</MenuItemFieldValueHTML>}</MenuItemField.Content>
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

export default MenuItemFieldHTML;
