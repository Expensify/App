import React, {useMemo, useRef} from 'react';
import {EditableCell, useInlineEditState} from '@components/Table/EditableCell';
import type {EditableProps} from '@components/Table/EditableCell/types';
import TextInput from '@components/TextInput';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';

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
        return Parser.htmlToText(merchantOrDescription).replaceAll('\n', ' ');
    }, [merchantOrDescription, isDescription]);

    const {isEditing, localValue, setLocalValue, startEditing, save} = useInlineEditState(canEdit, text, onSave);

    // Prevent double-save: for non-multiline inputs, pressing Enter fires onSubmitEditing then
    // immediately triggers a blur (blurOnSubmit=true by default), which would call save twice.
    const submitFiredRef = useRef(false);

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

    const isMultiline = isDescription;

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editContent={
                <TextInput
                    accessibilityLabel={isDescription ? 'Description input' : 'Merchant input'}
                    value={localValue}
                    onChangeText={setLocalValue}
                    onBlur={handleBlur}
                    onSubmitEditing={handleSubmitEditing}
                    autoFocus
                    multiline={isMultiline}
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
                style={shouldUseNarrowLayout ? [styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1] : [styles.lineHeightXLarge, isMultiline ? styles.preWrap : styles.pre]}
            />
        </EditableCell>
    );
}

export default MerchantOrDescriptionCell;
