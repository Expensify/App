import type {NumericEditingKeyPressEvent, NumericEditingRef} from '@components/NumericEditingController/types';
import NumericField from '@components/NumericField';
import type {NumericTextInputProps as NumericFieldTextInputProps} from '@components/NumericField/types';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import type {ReactNode, RefObject} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {AdapterRootProps} from './types';

const canUseTouchScreen = canUseTouchScreenUtil();

type TextInputFormProps = {
    /** Props of the NumericField root. The sign stays inside the typed value. */
    root: AdapterRootProps;

    /** Ref of the NumericField root */
    editingRef: RefObject<NumericEditingRef | null>;

    /** Props forwarded to `NumericField.TextInput` */
    textInputProps: Omit<NumericFieldTextInputProps, 'onKeyPress' | 'rightHandSideComponent'>;

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

    /** Whether the flip and currency buttons render without their pill background */
    shouldUseBorderlessButtons: boolean;
};

/** `displayAsTextInput` path of the legacy number form: a plain NumericField with its trailing controls. */
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
                    <NumericField.FlipButton
                        isDisabled={textInputProps.disabled}
                        isBorderless={shouldUseBorderlessButtons}
                    />
                )}
                {isCurrencyButtonVisible && (
                    <NumericField.CurrencyButton
                        currency={currencyButtonText}
                        onPress={onCurrencyButtonPress}
                        accessibilityLabel={currencyButtonAccessibilityLabel}
                        isDisabled={textInputProps.disabled}
                        isBorderless={shouldUseBorderlessButtons}
                    />
                )}
            </View>
        ) : undefined;

    // The text input takes the sign from the typed value, so a backspace on an empty value is the only way to clear the
    // parent-owned `isNegative` here
    const handleKeyPress = (event: NumericEditingKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();
        if (!root.value && key === 'backspace' && isNegative) {
            clearNegative?.();
        }
    };

    return (
        <NumericField
            value={root.value}
            onInputChange={root.onInputChange}
            allowNegative={root.allowNegative}
            decimals={root.decimals}
            maxLength={root.maxLength}
            errorText={root.errorText}
            ref={editingRef}
        >
            <NumericField.TextInput
                {...textInputProps}
                onKeyPress={handleKeyPress}
                rightHandSideComponent={rightHandSideComponent}
            />
        </NumericField>
    );
}

export default TextInputForm;
