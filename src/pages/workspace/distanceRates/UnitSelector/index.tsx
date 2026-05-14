import {Str} from 'expensify-common';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getUnitTranslationKey} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';

type UnitSelectorProps = {
    /** Custom unit ID to update when selecting a unit */
    customUnitID: string;

    /** Currently selected unit */
    defaultValue?: Unit;

    /** Label to display on field */
    label: string;

    /** Any additional styles to apply */
    wrapperStyle: StyleProp<ViewStyle>;
};

function UnitSelector({defaultValue, wrapperStyle, label, customUnitID}: UnitSelectorProps) {
    const {translate} = useLocalize();

    const openUnitSelector = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.UNIT_SELECTOR.getRoute(customUnitID)));
    };

    const title = defaultValue ? Str.recapitalize(translate(getUnitTranslationKey(defaultValue))) : '';

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={title}
            description={label}
            onPress={openUnitSelector}
            wrapperStyle={wrapperStyle}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.UNIT_SELECTOR}
        />
    );
}

export default UnitSelector;
