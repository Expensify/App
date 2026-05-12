import React from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
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

    /** Route to navigate to for the amount form page */
    amountRoute: Route;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
} & Pick<MenuItemBaseProps, 'rightLabel' | 'description'>;

function AmountPicker({value, description, title, errorText = '', rightLabel, amountRoute, ref}: AmountPickerProps) {
    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={callOrReturn(title, value)}
                description={description}
                onPress={() => {
                    Navigation.navigate(amountRoute);
                }}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                rightLabel={rightLabel}
                errorText={errorText}
            />
        </View>
    );
}

export default AmountPicker;
