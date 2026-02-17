import React, {useCallback, useMemo} from 'react';
import {EditableCell, useInlineEditState} from '@components/Table/EditableCell';
import TextInput from '@components/TextInput';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';

function MerchantOrDescriptionCell({
    merchantOrDescription,
    shouldShowTooltip,
    shouldUseNarrowLayout,
    isDescription,
    canEdit,
    onSave,
}: {
    merchantOrDescription: string;
    shouldUseNarrowLayout?: boolean;
    shouldShowTooltip: boolean;
    isDescription?: boolean;
    canEdit?: boolean;
    onSave?: (newValue: string) => void;
}) {
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
                    touchableInputWrapperStyle={[styles.p1, {height: '32px'}]}
                    containerStyles={[styles.flex1]}
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip={shouldShowTooltip}
                text={text}
                style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1]}
            />
        </EditableCell>
    );
}

export default MerchantOrDescriptionCell;
