import React, {useEffect, useMemo, useRef} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {EditableCell, useInlineEditState} from '@components/Table/EditableCell';
import type {EditableProps} from '@components/Table/EditableCell/types';
import TextInput from '@components/TextInput';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
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

    const text = useMemo(() => {
        if (!isDescription) {
            return merchantOrDescription;
        }
        return StringUtils.lineBreaksToSpaces(Parser.htmlToText(merchantOrDescription));
    }, [merchantOrDescription, isDescription]);

    const {isEditing, localValue, setLocalValue, startEditing, save} = useInlineEditState(canEdit, text, onSave);

    const isMultilineInput = isDescription;

    const handleChangeText = (value: string) => {
        // Sanitize line breaks on change for single line inputs.
        if (!isMultilineInput) {
            setLocalValue(StringUtils.removeLineBreaks(value));
            return;
        }
        setLocalValue(value);
    };

    // Prevent double-save: pressing Enter can fires onSubmitEditing (on single-line inputs) then
    // immediately triggers a blur (blurOnSubmit=true by default), which would call save twice.
    const submitFiredRef = useRef(false);

    // Reset the submit flag when entering edit mode to ensure clean state for each editing session
    useEffect(() => {
        if (!isEditing) {
            return;
        }
        submitFiredRef.current = false;
    }, [isEditing]);

    const handleSubmitEditing = () => {
        submitFiredRef.current = true;
        save();
    };

    const handleBlur = () => {
        if (submitFiredRef.current) {
            submitFiredRef.current = false;
            return;
        }
        save();
    };

    const handleKeyPress = (e: TextInputKeyPressEvent) => {
        if (isMultilineInput) {
            return;
        }

        // For single-line inputs (merchant), prevent Shift+Enter from inserting newlines
        if (e.nativeEvent.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
            e.preventDefault();
            handleSubmitEditing();
        }
    };

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editContent={
                <TextInput
                    accessibilityLabel={isDescription ? 'Description input' : 'Merchant input'}
                    value={localValue}
                    onChangeText={handleChangeText}
                    onKeyPress={handleKeyPress}
                    onBlur={handleBlur}
                    onSubmitEditing={handleSubmitEditing}
                    autoFocus
                    // We use a multiline TextInput for both merchant and description to keep editing behavior consistent.
                    // Since merchants are single-line, we sanitize line breaks before storing.
                    multiline
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
                numberOfLines={shouldUseNarrowLayout ? 1 : 2}
                style={shouldUseNarrowLayout ? [styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1] : [styles.lineHeightXLarge, styles.preWrap]}
            />
        </EditableCell>
    );
}

export default MerchantOrDescriptionCell;
