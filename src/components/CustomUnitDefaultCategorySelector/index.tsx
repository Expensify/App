import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

type CustomUnitDefaultCategorySelectorProps = {
    /** Currently selected category */
    defaultValue?: string;

    label: string;
    wrapperStyle: StyleProp<ViewStyle>;

    /** The custom unit ID to update when selecting a category */
    customUnitID: string;

    /** Whether the selector should navigate to the edit flow */
    interactive?: boolean;
};

function CustomUnitDefaultCategorySelector({defaultValue = '', wrapperStyle, label, customUnitID, interactive = true}: CustomUnitDefaultCategorySelectorProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    const decodedCategoryName = getDecodedCategoryName(defaultValue);
    const title = decodedCategoryName || translate('common.none');

    const onPress = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.DEFAULT_CATEGORY_SELECTOR.getRoute(customUnitID)));
    };

    return (
        <MenuItem.Root
            onPress={interactive ? callIfAuthenticated(onPress, session) : undefined}
            style={wrapperStyle}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.CATEGORY_SELECTOR}
        >
            <MenuItemField.Row
                name={label}
                value={title}
            >
                {interactive && <MenuItem.Chevron />}
            </MenuItemField.Row>
        </MenuItem.Root>
    );
}

export default CustomUnitDefaultCategorySelector;
