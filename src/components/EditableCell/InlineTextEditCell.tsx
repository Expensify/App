import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useThemeStyles from '@hooks/useThemeStyles';

import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';

import React, {useRef} from 'react';

import type {EditableProps} from './types';

import EditableCell from './EditableCell';
import useInlineEditState from './useInlineEditState';

type InlineTextEditCellProps = {
    /** Current value shown in display mode and used as the initial edit buffer */
    value: string;

    /** Accessibility label for the text input while editing */
    accessibilityLabel: string;

    /** Whether to show a tooltip over the display text */
    shouldShowTooltip?: boolean;

    /** Style applied to the display text and to the TextInput while editing, so font size and color stay in sync */
    displayTextStyle?: StyleProp<TextStyle>;

    /** Normalizes the value before saving and for change detection (defaults to trimming) */
    sanitize?: (value: string) => string;
} & EditableProps<string>;

/** Default normalization: trim surrounding whitespace. Hoisted so it is a stable reference for React Compiler. */
const trimValue = (input: string) => input.trim();

/**
 * Generic inline text editing cell for tables. Composes `EditableCell` with an inline `TextInput`
 * and the shared inline edit state (buffered value, save-on-blur, escape-to-cancel). Domain tables
 * supply the value, a `canEdit` flag, and an `onSave` handler that performs the actual persistence.
 *
 * Invalid values are handled by `onSave` (which no-ops on rejection); the cell then reverts to the
 * original value, matching the Spend inline-edit behavior. On narrow layouts `EditableCell` renders
 * the display text only, so tables keep their existing tap-to-navigate behavior there.
 */
function InlineTextEditCell({value, accessibilityLabel, shouldShowTooltip = true, displayTextStyle, canEdit, onSave, sanitize = trimValue}: InlineTextEditCellProps) {
    const styles = useThemeStyles();
    const inputRef = useRef<BaseTextInputRef | null>(null);

    const {isEditing, localValue, setLocalValue, startEditing, save, cancelEditing} = useInlineEditState(
        canEdit,
        value,
        onSave ? (newValue) => onSave(sanitize(newValue)) : undefined,
        (newValue, originalValue) => sanitize(newValue) === sanitize(originalValue),
    );

    const handleChangeText = (text: string) => setLocalValue(StringUtils.lineBreaksToSpaces(text));

    const handleEscape = () => {
        cancelEditing();
        inputRef.current?.blur();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleEscape, {captureOnInputs: true, isActive: isEditing});

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editContent={
                <TextInput
                    ref={inputRef}
                    accessibilityLabel={accessibilityLabel}
                    value={localValue}
                    onChangeText={handleChangeText}
                    onBlur={save}
                    onSubmitEditing={save}
                    autoFocus
                    submitBehavior="blurAndSubmit"
                    // Match the display cell's type (e.g. supporting label size on Expensify card names).
                    inputStyle={displayTextStyle}
                    // EditableCell owns the cell's hover and focus styles (border, background).
                    // Suppress TextInput's own border and background to avoid visual conflicts.
                    textInputContainerStyles={styles.editableCellInputStyle}
                    touchableInputWrapperStyle={styles.editableCellInputStyle}
                    hideFocusedState
                    shouldApplyPaddingToContainer={false}
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip={shouldShowTooltip}
                text={localValue}
                numberOfLines={1}
                style={displayTextStyle}
            />
        </EditableCell>
    );
}

InlineTextEditCell.displayName = 'InlineTextEditCell';

export default InlineTextEditCell;
export type {InlineTextEditCellProps};
