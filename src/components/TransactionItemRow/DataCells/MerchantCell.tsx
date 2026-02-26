import React, {useCallback, useMemo} from 'react';
import {EditableCell, useInlineEditState} from '@components/Table/EditableCell';
import type {EditableProps} from '@components/Table/EditableCell/types';
import TextInput from '@components/TextInput';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';

function MerchantOrDescriptionCell({
    merchantOrDescription,
    shouldShowTooltip,
    shouldUseNarrowLayout,
    isDescription,
    isEditable,
    canEdit,
    onSave,
}: {
    merchantOrDescription: string;
    shouldUseNarrowLayout?: boolean;
    shouldShowTooltip: boolean;
    isDescription?: boolean;
} & EditableProps<string>) {
    const styles = useThemeStyles();

    const text = useMemo(() => {
        if (!isDescription) {
            return merchantOrDescription;
        }
        return Parser.htmlToText(merchantOrDescription).replaceAll('\n', ' ');
    }, [merchantOrDescription, isDescription]);

    const {isEditing, localValue, setLocalValue, startEditing, save} = useInlineEditState(text, onSave);

    const handleBlur = useCallback(() => {
        save();
    }, [save]);

    return (
        <EditableCell
            isEditable={isEditable}
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editContent={
                <TextInput
                    accessibilityLabel={isDescription ? 'Description input' : 'Merchant input'}
                    value={localValue}
                    onChangeText={setLocalValue}
                    onBlur={handleBlur}
                    autoFocus
                    // EditableCell is responsible for the cell's hover and focus styles (border, background).
                    // Suppress TextInput's own border and background to avoid visual conflicts.
                    textInputContainerStyles={[styles.editableCellInputStyle]}
                    touchableInputWrapperStyle={[styles.editableCellInputStyle]}
                    hideFocusedState
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip={shouldShowTooltip}
                text={localValue}
                style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1]}
            />
        </EditableCell>
    );
}

export default MerchantOrDescriptionCell;
