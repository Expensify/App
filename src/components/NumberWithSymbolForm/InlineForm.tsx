import type {AmountEditingRef} from '@components/AmountEditingController/types';
import AmountFormField from '@components/AmountFormField';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {RefObject} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {AdapterRootProps, AdapterTextInputProps, SymbolPosition} from './types';

type InlineFormProps = {
    /** Props of the AmountFormField root, already carrying the canonical signed value */
    root: AdapterRootProps;

    /** Ref of the root */
    editingRef: RefObject<AmountEditingRef | null>;

    /** Props forwarded to the text input */
    textInputProps: AdapterTextInputProps;

    /** Text input instance, focused when the caller's scroll view row is pressed */
    textInputRef: RefObject<BaseTextInputRef | null>;

    /** Label of the split row text input */
    label?: string;

    /** Symbol displayed beside the number, or an empty string for none. It is plain text beside the input, like the legacy non-pressable symbol. */
    symbol: string;

    /** Position of the symbol relative to the input */
    symbolPosition: SymbolPosition;

    /** Style applied to the symbol text */
    symbolTextStyle?: StyleProp<TextStyle>;

    /** Style of the outer text input wrapper, the sibling of the symbol */
    outerContainerStyles?: StyleProp<ViewStyle>;

    /** Style of the caller's scroll view row */
    scrollViewStyle?: StyleProp<ViewStyle>;

    /** Whether pressing the caller's scroll view row refocuses the input */
    shouldRefocusOnScrollViewClick: boolean;
};

/**
 * `shouldWrapInputInContainer={false}` path of the legacy number form. Its callers are the split rows (OptionRow, the confirmation
 * page split and the split expense page), which hide the symbol and keep the sign inside the value, and the inline table cell
 * (InlineNumberEditCell), which shows a plain-text symbol before the number. An AmountFormField renders them all, with the
 * symbol beside the input as the legacy form laid it out.
 */
function InlineForm({
    root,
    editingRef,
    textInputProps,
    textInputRef,
    label,
    symbol,
    symbolPosition,
    symbolTextStyle,
    outerContainerStyles,
    scrollViewStyle,
    shouldRefocusOnScrollViewClick,
}: InlineFormProps) {
    const styles = useThemeStyles();
    const {numberFormat} = useLocalize();

    const symbolNode = symbol ? (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Text style={[styles.iouAmountText, styles.lineHeightUndefined, symbolTextStyle]}>{symbol}</Text>
        </View>
    ) : null;
    const isSuffix = symbolPosition === CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX;

    // The legacy form always wrapped the row in a scroll view, which also gave the row its flex-grow behavior
    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, scrollViewStyle]}
            style={[styles.flexGrow0, shouldRefocusOnScrollViewClick && styles.cursorAuto]}
            onMouseDown={(e) => {
                if (!shouldRefocusOnScrollViewClick) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                textInputRef.current?.focus();
            }}
        >
            <AmountFormField
                value={root.value}
                onInputChange={root.onInputChange}
                allowNegative={root.allowNegative}
                decimals={root.decimals}
                maxLength={root.maxLength}
                errorText={root.errorText}
                ref={editingRef}
            >
                {!isSuffix && symbolNode}
                <AmountFormField.Input
                    {...textInputProps}
                    containerStyles={outerContainerStyles}
                    label={label}
                    accessibilityLabel={textInputProps.accessibilityLabel ?? label}
                    // The legacy amount input kept a small gap after the number
                    style={[styles.pr1, textInputProps.style]}
                    // The legacy amount input showed a zero placeholder, used the full input height, and hid the iPad keyboard suggestions
                    placeholder={numberFormat(0)}
                    shouldUseFullInputHeight
                    autoCorrect={false}
                    spellCheck={false}
                />
                {isSuffix && symbolNode}
            </AmountFormField>
        </ScrollView>
    );
}

export default InlineForm;
