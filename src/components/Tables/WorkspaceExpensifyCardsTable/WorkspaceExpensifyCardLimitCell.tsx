import {EditableCell, useInlineEditState} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToFrontendAmountAsString, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';

import React, {useRef} from 'react';

type WorkspaceExpensifyCardLimitCellProps = {
    /** Unapproved expense limit in cents */
    limit: number;
    currency?: string;
    displayText: string;
} & EditableProps<string>;

function WorkspaceExpensifyCardLimitCell({limit, currency = CONST.CURRENCY.USD, displayText, canEdit, onSave}: WorkspaceExpensifyCardLimitCellProps) {
    const styles = useThemeStyles();
    const {preferredLocale, translate} = useLocalize();
    const inputRef = useRef<BaseTextInputRef | null>(null);
    const frontendLimit = convertToFrontendAmountAsString(limit, 0);

    const {isEditing, setLocalValue, startEditing, save, cancelEditing} = useInlineEditState(
        canEdit,
        frontendLimit,
        onSave,
        (newValue, originalValue) => Number(newValue) === Number(originalValue),
    );

    const focusOnMount = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
        ref?.focus();
    };

    const cancelAndBlur = () => {
        cancelEditing();
        inputRef.current?.blur();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, cancelAndBlur, {captureOnInputs: true, isActive: isEditing});

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editIconPosition="left"
            editContent={
                <NumberWithSymbolForm
                    ref={focusOnMount}
                    value={frontendLimit}
                    currency={currency}
                    symbol={getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''}
                    symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
                    isSymbolPressable={false}
                    disableKeyboard={false}
                    shouldShowBigNumberPad={false}
                    shouldWrapInputInContainer={false}
                    shouldApplyPaddingToContainer={false}
                    hideFocusedState
                    onInputChange={setLocalValue}
                    onBlur={save}
                    onSubmitEditing={save}
                    accessibilityLabel={translate('workspace.expensifyCard.limit')}
                    style={[styles.lh16, styles.optionDisplayName, styles.pr0, styles.textAlignRight]}
                    containerStyle={[styles.editableCellInputStyle]}
                    touchableInputWrapperStyle={styles.editableCellInputStyle}
                    scrollViewStyle={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}
                    symbolTextStyle={styles.editableCellSymbolStyle}
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip
                numberOfLines={1}
                text={displayText}
                style={[styles.lh16, styles.optionDisplayName, styles.pre, styles.flexShrink1, styles.textAlignRight]}
            />
        </EditableCell>
    );
}

export default WorkspaceExpensifyCardLimitCell;
