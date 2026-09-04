import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController';
import {useNumericInputActions, useNumericInputState} from '@components/NumericInput/context';
import useNumericPressSelection from '@components/NumericInput/hooks/useNumericPressSelection';
import type {NumericTextInputProps} from '@components/NumericInput/types';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import {useMouseActions} from '@hooks/useMouseContext';
import useThemeStyles from '@hooks/useThemeStyles';

import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';

import type {MouseEvent} from 'react';
import type {TextInputKeyPressEvent, TextInputSelectionChangeEvent} from 'react-native';

import {useNavigation} from '@react-navigation/native';
/** Renders the number itself, displaying and editing the canonical value owned by the root. */
function NumericTextInput({
    style,
    ref,
    onKeyPress,
    onBlur,
    accessibilityLabel,
    autoFocus,
    autoGrow = true,
    autoGrowExtraSpace,
    autoGrowMarginSide,
    containerStyle,
    disabled,
    disableKeyboard = true,
    hideFocusedState = true,
    keyboardType,
    onFocus,
    onPress,
    onSubmitEditing,
    prefixCharacter,
    prefixStyle,
    prefixContainerStyle,
    shouldAllowFocusInLandscapeMode = true,
    shouldApplyPaddingToContainer = false,
    shouldUseDefaultLineHeightForPrefix,
    testID,
    touchableInputWrapperStyle,
}: NumericTextInputProps) {
    const {numberFormat, translate} = useLocalize();
    const {setMouseDown, setMouseUp} = useMouseActions();
    const styles = useThemeStyles();
    const navigation = useNavigation();
    const {formattedNumber, inputRef, isNegative, selection} = useNumericInputState();
    const {clearSign, handleKeyPress, handleSelectionChange, setNumber} = useNumericInputActions();

    const handlePress = useNumericPressSelection(onPress);

    const handleInputKeyPress = (event: NumericEditingKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();

        // The minus sign is rendered outside the input, so backspacing an empty input clears it.
        if (!formattedNumber && key === 'backspace' && isNegative) {
            clearSign();
        }

        handleKeyPress(event);
        onKeyPress?.(event);
    };

    const handleMouseDown = (event: MouseEvent<Element>) => {
        event.stopPropagation();
        setMouseDown();
    };

    const handleMouseUp = (event: MouseEvent<Element>) => {
        event.stopPropagation();
        setMouseUp();
    };

    return (
        <TextInput
            accessibilityLabel={accessibilityLabel ?? translate('iou.amount')}
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            // On iPad, even if the soft keyboard is hidden, the keyboard suggestion is still shown.
            // Setting both autoCorrect and spellCheck to false will hide the suggestion.
            autoCorrect={false}
            autoFocus={autoFocus}
            autoGrow={autoGrow}
            autoGrowExtraSpace={autoGrowExtraSpace}
            autoGrowMarginSide={autoGrowMarginSide}
            disabled={disabled}
            disableKeyboard={disableKeyboard}
            disableKeyboardShortcuts
            hideFocusedState={hideFocusedState}
            inputMode={!keyboardType ? CONST.INPUT_MODE.DECIMAL : undefined}
            inputStyle={[styles.pr1, style]}
            keyboardType={keyboardType}
            // The navigation prop keeps disableKeyboard working when the app returns from the background.
            navigation={navigation}
            onBlur={onBlur}
            onChangeText={setNumber}
            onFocus={onFocus}
            onKeyPress={handleInputKeyPress as (event: TextInputKeyPressEvent) => void}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onPress={handlePress}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => handleSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end)}
            onSubmitEditing={onSubmitEditing}
            placeholder={numberFormat(0)}
            prefixCharacter={prefixCharacter}
            prefixContainerStyle={prefixContainerStyle}
            prefixStyle={prefixStyle}
            // The root's ref drives focus and the web caret sync, so the caller's ref is merged into it.
            ref={mergeRefs(inputRef, ref)}
            selection={selection}
            shouldAllowFocusInLandscapeMode={shouldAllowFocusInLandscapeMode}
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            shouldInterceptSwipe
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
            shouldUseFullInputHeight
            spellCheck={false}
            submitBehavior="submit"
            testID={testID}
            textInputContainerStyles={containerStyle}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            value={formattedNumber}
        />
    );
}

export default NumericTextInput;
