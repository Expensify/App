import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useCurrencyList from '@hooks/useCurrencyList';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type CurrencyPickerProps = {
    /** Label for the input */
    label: string;

    /** Current value of the selected item */
    value?: string;

    /** Form Error description */
    errorText?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;

    /** Any additional styles to apply on the outer element */
    style?: StyleProp<ViewStyle>;
};

function OnboardingCurrencyPicker({label, value, errorText, style, onInputChange, onBlur}: CurrencyPickerProps) {
    const {getCurrencySymbol} = useCurrencyList();
    const didOpenCurrencySelector = useRef(false);
    const isFocused = useIsFocused();
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, {canBeMissing: true});
    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (draftValues?.currency) {
            onInputChange?.(draftValues.currency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftValues?.currency]);

    useEffect(() => {
        if (!isFocused || !didOpenCurrencySelector.current) {
            return;
        }
        didOpenCurrencySelector.current = false;
        onBlur?.();
    }, [isFocused, onBlur]);

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={value ? `${value} - ${getCurrencySymbol(value)}` : undefined}
            description={label}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={errorText}
            style={style}
            onPress={() => {
                didOpenCurrencySelector.current = true;
                Navigation.navigate(ROUTES.ONBOARDING_WORKSPACE_CURRENCY.getRoute(Navigation.getActiveRoute()));
            }}
        />
    );
}

export default OnboardingCurrencyPicker;
