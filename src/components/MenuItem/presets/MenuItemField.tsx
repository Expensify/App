import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRow from '@components/MenuItem/layout/MenuItemRow';
import MenuItemTrailing from '@components/MenuItem/layout/MenuItemTrailing';
import MenuItemLabel from '@components/MenuItem/leaves/text/MenuItemLabel';
import MenuItemChevron from '@components/MenuItem/leaves/trailing/MenuItemChevron';
import MenuItemRightLabel from '@components/MenuItem/leaves/trailing/MenuItemRightLabel';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {PropsWithChildren} from 'react';
import type {GestureResponderEvent} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import MenuItemEmptyField from './MenuItemEmptyField';

type MenuItemFieldProps = PropsWithChildren &
    WithSentryLabel &
    WithTestID & {
        /** Name of the field. Stands in for the value while the field is empty, and moves up into the label once it has one */
        label: string;

        /** The picked value. This is what decides if the field is empty or filled */
        value?: string;

        /** Whether to show the `Required` hint. Only reaches the screen while the field is empty, since a filled field cannot be missing */
        isRequired?: boolean;

        /** Function to fire when the row is pressed. Omit to make the row non-interactive, which also drops the chevron */
        onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;
    };

/** The field MenuItem preset — a form field whose value the user picks on another screen */
function MenuItemField({label, value, isRequired = false, onPress, isDisabled = false, sentryLabel, testID, children}: MenuItemFieldProps) {
    const styles = useThemeStyles();
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
        <>
            <View style={[styles.mh5, styles.mt3]}>
                <MenuItemLabel>{label}</MenuItemLabel>
            </View>
            <MenuItemRoot
                onPress={onPress ? callFunctionIfActionIsAllowed(onPress) : undefined}
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
            </MenuItemRoot>
        </>
    );
}

export default MenuItemField;
