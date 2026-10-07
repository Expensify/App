import type {AmountEditingKeyPressEvent, AmountEditingRef} from '@components/AmountEditingController/types';
import AmountFormField from '@components/AmountFormField';
import type {AmountFormFieldInputProps} from '@components/AmountFormField/types';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import type {ComponentRef, ForwardedRef, ReactNode, RefObject} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {AdapterRootProps} from './types';

const canUseTouchScreen = canUseTouchScreenUtil();

type TextInputFormProps = {
    /** Props of the AmountFormField root. The sign stays inside the typed value. */
    root: AdapterRootProps;

    /** Ref of the AmountFormField root */
    editingRef: RefObject<AmountEditingRef | null>;

    /** Props forwarded to `AmountFormField.Input` */
    textInputProps: Omit<AmountFormFieldInputProps, 'onKeyPress' | 'rightHandSideComponent'>;

    /** Sign the caller holds next to the value, cleared by a backspace on an empty value */
    isNegative: boolean;

    /** Caller callback clearing its negative sign */
    clearNegative?: () => void;

    /** Whether the caller asked for the flip button */
    shouldShowFlipButton: boolean;

    /** Whether the caller asked for the currency button */
    shouldShowCurrencyButton: boolean;

    /** Extra content rendered before the flip and currency buttons */
    leadingRightHandSideComponent?: ReactNode;

    /** Label of the currency button */
    currencyButtonText: string;

    /** Called when the currency button is pressed */
    onCurrencyButtonPress?: () => void;

    /** Accessibility label of the currency button */
    currencyButtonAccessibilityLabel?: string;

    /** Ref to the currency button */
    currencyButtonRef?: ForwardedRef<ComponentRef<typeof View>>;

    /** Whether the flip and currency buttons render without their pill background */
    shouldUseBorderlessButtons: boolean;
};

/** `displayAsTextInput` path of the legacy number form: a plain AmountFormField with its trailing controls. */
function TextInputForm({
    root,
    editingRef,
    textInputProps,
    isNegative,
    clearNegative,
    shouldShowFlipButton,
    shouldShowCurrencyButton,
    leadingRightHandSideComponent,
    currencyButtonText,
    onCurrencyButtonPress,
    currencyButtonAccessibilityLabel,
    currencyButtonRef,
    shouldUseBorderlessButtons,
}: TextInputFormProps) {
    const styles = useThemeStyles();

    const isFlipButtonVisible = shouldShowFlipButton && root.allowNegative && canUseTouchScreen;
    const isCurrencyButtonVisible = shouldShowCurrencyButton && !!currencyButtonText;

    const rightHandSideComponent =
        isFlipButtonVisible || isCurrencyButtonVisible || !!leadingRightHandSideComponent ? (
            <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                {leadingRightHandSideComponent}
                {isFlipButtonVisible && (
                    <AmountFormField.SignFlipButton
                        isDisabled={textInputProps.disabled}
                        isBorderless={shouldUseBorderlessButtons}
                    />
                )}
                {isCurrencyButtonVisible && (
                    <AmountFormField.CurrencyPickerButton
                        currency={currencyButtonText}
                        onPress={onCurrencyButtonPress}
                        accessibilityLabel={currencyButtonAccessibilityLabel}
                        ref={currencyButtonRef}
                        isDisabled={textInputProps.disabled}
                        isBorderless={shouldUseBorderlessButtons}
                    />
                )}
            </View>
        ) : undefined;

    // The text input takes the sign from the typed value, so a backspace on an empty value is the only way to clear the
    // parent-owned `isNegative` here
    const handleKeyPress = (event: AmountEditingKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();
        // The live input value decides, as the caller's `value` prop can lag behind what was typed
        if (!editingRef.current?.getNumber() && key === 'backspace' && isNegative) {
            clearNegative?.();
        }
    };

    return (
        <AmountFormField
            value={root.value}
            onInputChange={root.onInputChange}
            allowNegative={root.allowNegative}
            decimals={root.decimals}
            maxLength={root.maxLength}
            errorText={root.errorText}
            ref={editingRef}
        >
            <AmountFormField.Input
                {...textInputProps}
                onKeyPress={handleKeyPress}
                rightHandSideComponent={rightHandSideComponent}
            />
        </AmountFormField>
    );
}

export default TextInputForm;
