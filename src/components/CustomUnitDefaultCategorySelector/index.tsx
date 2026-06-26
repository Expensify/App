import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

type CustomUnitDefaultCategorySelectorProps = {
    /** Currently selected category */
    defaultValue?: string;

    /** Label to display on field */
    label: string;

    /** Any additional styles to apply */
    wrapperStyle: StyleProp<ViewStyle>;

    /** Whether item is focused or active */
    focused?: boolean;

    /** The custom unit ID to update when selecting a category */
    customUnitID: string;

    /** Whether the selector should navigate to the edit flow */
    interactive?: boolean;
};

function CustomUnitDefaultCategorySelector({defaultValue = '', wrapperStyle, label, focused, customUnitID, interactive = true}: CustomUnitDefaultCategorySelectorProps) {
    const styles = useThemeStyles();

    const decodedCategoryName = getDecodedCategoryName(defaultValue);
    const descStyle = decodedCategoryName.length === 0 ? styles.textNormal : null;

    const onPress = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.DEFAULT_CATEGORY_SELECTOR.getRoute(customUnitID)));
    };

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={interactive}
            title={decodedCategoryName}
            description={label}
            descriptionTextStyle={descStyle}
            onPress={onPress}
            interactive={interactive}
            wrapperStyle={wrapperStyle}
            focused={focused}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.CATEGORY_SELECTOR}
        />
    );
}

export default CustomUnitDefaultCategorySelector;
