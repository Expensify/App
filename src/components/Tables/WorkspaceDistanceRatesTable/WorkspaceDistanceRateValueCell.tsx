import {EditableCell, useInlineEditState} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {parseFloatAnyLocale} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import type {Rate} from '@src/types/onyx/Policy';

import React, {useRef} from 'react';

type WorkspaceDistanceRateValueCellProps = {
    rate: Rate;
    displayText: string;
} & EditableProps<string>;

function WorkspaceDistanceRateValueCell({rate, displayText, canEdit, onSave}: WorkspaceDistanceRateValueCellProps) {
    const styles = useThemeStyles();
    const {preferredLocale, translate} = useLocalize();
    const inputRef = useRef<BaseTextInputRef | null>(null);
    const currency = rate.currency ?? CONST.CURRENCY.USD;
    const rateValue = (parseFloat((rate.rate ?? 0).toString()) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(CONST.MAX_TAX_RATE_DECIMAL_PLACES);

    const {isEditing, setLocalValue, startEditing, save, cancelEditing} = useInlineEditState(
        canEdit,
        rateValue,
        onSave,
        (newValue, originalValue) => parseFloatAnyLocale(newValue) === parseFloatAnyLocale(originalValue),
    );

    const focusOnMount = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
        ref?.focus();
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
                <NumberWithSymbolForm
                    ref={focusOnMount}
                    value={rateValue}
                    decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
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
                    accessibilityLabel={translate('workspace.distanceRates.rate')}
                    style={[styles.lh16, styles.optionDisplayName, styles.pr0]}
                    containerStyle={[styles.editableCellInputStyle]}
                    touchableInputWrapperStyle={styles.editableCellInputStyle}
                    scrollViewStyle={[styles.flexRow, styles.alignItemsCenter]}
                    symbolTextStyle={styles.editableCellSymbolStyle}
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip
                numberOfLines={1}
                text={displayText}
                style={[styles.lh16, styles.optionDisplayName, styles.pre, styles.flexShrink1]}
            />
        </EditableCell>
    );
}

export default WorkspaceDistanceRateValueCell;
