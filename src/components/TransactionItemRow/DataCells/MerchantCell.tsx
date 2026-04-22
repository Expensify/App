import React, {useMemo, useRef} from 'react';
import type {TextInput as RNTextInput} from 'react-native';
import {EditableCell, useInlineEditState} from '@components/Table/EditableCell';
import type {EditableProps} from '@components/Table/EditableCell/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useThemeStyles from '@hooks/useThemeStyles';
import {moveSelectionToEnd, scrollToBottom} from '@libs/InputUtils';
import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';

type MerchantOrDescriptionCellProps = {
    merchantOrDescription: string;
    shouldUseNarrowLayout?: boolean;
    shouldShowTooltip: boolean;
    isDescription?: boolean;
} & EditableProps<string>;

function MerchantOrDescriptionCell({merchantOrDescription, shouldShowTooltip, shouldUseNarrowLayout, isDescription, canEdit, onSave}: MerchantOrDescriptionCellProps) {
    const styles = useThemeStyles();
    const inputRef = useRef<RNTextInput | null>(null);

    const text = useMemo(() => {
        if (!isDescription) {
            return merchantOrDescription;
        }
        return StringUtils.lineBreaksToSpaces(Parser.htmlToText(merchantOrDescription));
    }, [merchantOrDescription, isDescription]);

    const {isEditing, localValue, setLocalValue, startEditing, save, cancelEditing} = useInlineEditState(canEdit, text, onSave);

    const isMultilineInput = isDescription;

    const handleChangeText = (value: string) => {
        // Sanitize line breaks on change for single line inputs.
        if (!isMultilineInput) {
            setLocalValue(StringUtils.removeLineBreaks(value));
            return;
        }
        setLocalValue(value);
    };

    const handleRef = (element: BaseTextInputRef | null) => {
        inputRef.current = element as RNTextInput | null;
    };

    // Multiline TextInputs with autoFocus default cursor to the beginning; manually position it at the end on focus
    const handleFocus = () => {
        requestAnimationFrame(() => {
            const input = inputRef.current;
            if (!input) {
                return;
            }

            scrollToBottom(input);
            moveSelectionToEnd(input);
        });
    };

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
                    ref={handleRef}
                    accessibilityLabel={isDescription ? 'Description input' : 'Merchant input'}
                    value={localValue}
                    onChangeText={handleChangeText}
                    onBlur={save}
                    onSubmitEditing={save}
                    onFocus={handleFocus}
                    autoFocus
                    submitBehavior="blurAndSubmit"
                    // EditableCell is responsible for the cell's hover and focus styles (border, background).
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
                style={shouldUseNarrowLayout ? [styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1] : [styles.lineHeightXLarge]}
            />
        </EditableCell>
    );
}

export default MerchantOrDescriptionCell;
