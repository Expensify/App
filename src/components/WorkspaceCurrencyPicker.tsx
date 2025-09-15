import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useOnyx from '@hooks/useOnyx';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceConfirmationNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceCurrencyPickerProps = {
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

function WorkspaceCurrencyPicker({label, value, errorText, style, onInputChange, onBlur}: WorkspaceCurrencyPickerProps) {
    const didOpenCurrencySelector = useRef(false);
    const isFocused = useIsFocused();
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT, {canBeMissing: true});

    const route = useRoute<PlatformStackRouteProp<WorkspaceConfirmationNavigatorParamList, typeof SCREENS.CURRENCY.SELECTION>>();
    const backTo = route.params?.backTo;

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (draftValues?.currency) {
            onInputChange?.(draftValues.currency);
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
                Navigation.navigate(ROUTES.CURRENCY_SELECTION.getRoute(backTo));
            }}
        />
    );
}

WorkspaceCurrencyPicker.displayName = 'WorkspaceCurrencyPicker';
export default WorkspaceCurrencyPicker;
