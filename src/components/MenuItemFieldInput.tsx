/** A composable field row that exposes the ref and validation feedback required by InputWrapper. */
import useOnyx from '@hooks/useOnyx';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenTypeSelector} from '@src/selectors/Session';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

import type {MenuItemRootProps} from './MenuItem/layout/MenuItemRoot';

import MenuItem from './MenuItem';
import MenuItemField from './MenuItem/presets/MenuItemField';

type MenuItemFieldInputProps = WithRequiredSentryLabel & {
    name: string;
    value?: string;

    /** A human-readable value when the form stores a different wire value. */
    displayValue?: string;

    errorText?: string;
    onPress: NonNullable<MenuItemRootProps['onPress']>;
    ref?: MenuItemRootProps['ref'];
};

function MenuItemFieldInput({name, value, displayValue = value, errorText, onPress, sentryLabel, ref}: MenuItemFieldInputProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    return (
        <MenuItem.Root
            ref={ref}
            onPress={callIfAuthenticated(onPress, session)}
            sentryLabel={sentryLabel}
        >
            <MenuItemField.Row
                name={name}
                value={displayValue}
            >
                {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                <MenuItem.Chevron />
            </MenuItemField.Row>
            {!!errorText && (
                <MenuItem.HelpText
                    isError
                    message={errorText}
                />
            )}
        </MenuItem.Root>
    );
}

export default MenuItemFieldInput;
