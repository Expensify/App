import type {NumericEditingRef} from '@components/NumericEditingController/types';
import NumericField from '@components/NumericField';
import ScrollView from '@components/ScrollView';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {RefObject} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import type {AdapterRootProps, AdapterTextInputProps} from './types';

type InlineFormProps = {
    /** Props of the NumericField root, already carrying the canonical signed value */
    root: AdapterRootProps;

    /** Ref of the root */
    editingRef: RefObject<NumericEditingRef | null>;

    /** Props forwarded to the text input */
    textInputProps: AdapterTextInputProps;

    /** Text input instance, focused when the caller's scroll view row is pressed */
    textInputRef: RefObject<BaseTextInputRef | null>;

    /** Label of the split row text input */
    label?: string;

    /** Symbol displayed beside the number, or an empty string for none. Shown as the input prefix when no prefix is set. */
    symbol: string;

    /** Style of the caller's scroll view row */
    scrollViewStyle?: StyleProp<ViewStyle>;

    /** Whether pressing the caller's scroll view row refocuses the input */
    shouldRefocusOnScrollViewClick: boolean;
};

/**
 * `shouldWrapInputInContainer={false}` path of the legacy number form, used by split rows (OptionRow, the confirmation page
 * split and the split expense page). They hide the symbol behind the input's own prefix and keep the sign inside the value,
 * so a NumericField renders them. The table total cell has its own editor and no longer comes through here.
 */
function InlineForm({root, editingRef, textInputProps, textInputRef, label, symbol, scrollViewStyle, shouldRefocusOnScrollViewClick}: InlineFormProps) {
    const styles = useThemeStyles();
    const {numberFormat} = useLocalize();

    const field = (
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
                // An empty prefix falls back to the visible symbol
                prefixCharacter={textInputProps.prefixCharacter ? textInputProps.prefixCharacter : symbol}
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
        </NumericField>
    );

    if (!scrollViewStyle && !shouldRefocusOnScrollViewClick) {
        return field;
    }

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
            {field}
        </ScrollView>
    );
}

export default InlineForm;
