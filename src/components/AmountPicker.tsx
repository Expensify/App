import React from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import callOrReturn from '@src/types/utils/callOrReturn';
import type {MenuItemBaseProps} from './MenuItem';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type AmountPickerProps = {
    /** Item to display */
    value?: string;

    /** A placeholder value to display */
    title?: string | ((value?: string) => string);

    /** Form Error description */
    errorText?: string;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
} & Pick<MenuItemBaseProps, 'rightLabel' | 'description'>;

function AmountPicker({value, description, title, errorText = '', rightLabel, ref}: AmountPickerProps) {
    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={callOrReturn(title, value)}
                description={description}
                onPress={() => {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AMOUNT_SELECTOR.path));
                }}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                rightLabel={rightLabel}
                errorText={errorText}
            />
        </View>
    );
}

export default AmountPicker;
