import React from 'react';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import themeColors from '../../../../styles/themes/default';
import Composer from '../../../../components/Composer';
import containerComposeStyles from '../../../../styles/containerComposeStyles';

function SoloComposer({
    checkComposerVisibility,
    shouldAutoFocus,
    setTextInputRef,
    inputPlaceholder,
    updateComment,
    triggerHotkeyActions,
    isComposerFullSize,
    maxComposerLines,
    setIsFocused,
    suggestionsRef,
    updateShouldShowSuggestionMenuToFalse,
    displayFileInModal,
    textInputShouldClear,
    setTextInputShouldClear,
    isBlockedFromConcierge,
    disabled,
    selection,
    onSelectionChange,
    isFullSizeComposerAvailable,
    setIsFullComposerAvailable,
    value,
    numberOfLines,
    updateNumberOfLines,
    composerHeight,
    setComposerHeight,
}) {
    return (
        <View style={[containerComposeStyles, styles.textInputComposeBorder]}>
            <Composer
                checkComposerVisibility={checkComposerVisibility}
                autoFocus={shouldAutoFocus}
                multiline
                ref={setTextInputRef}
                textAlignVertical="top"
                placeholder={inputPlaceholder}
                placeholderTextColor={themeColors.placeholderText}
                onChangeText={(commentValue) => updateComment(commentValue, true)}
                onKeyPress={triggerHotkeyActions}
                style={[styles.textInputCompose, isComposerFullSize ? styles.textInputFullCompose : styles.flex4]}
                maxLines={maxComposerLines}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setIsFocused(false);
                    suggestionsRef.current.resetSuggestions();
                }}
                onClick={updateShouldShowSuggestionMenuToFalse}
                onPasteFile={displayFileInModal}
                shouldClear={textInputShouldClear}
                onClear={() => setTextInputShouldClear(false)}
                isDisabled={isBlockedFromConcierge || disabled}
                selection={selection}
                onSelectionChange={onSelectionChange}
                isFullComposerAvailable={isFullSizeComposerAvailable}
                setIsFullComposerAvailable={setIsFullComposerAvailable}
                isComposerFullSize={isComposerFullSize}
                value={value}
                numberOfLines={numberOfLines}
                onNumberOfLinesChange={updateNumberOfLines}
                shouldCalculateCaretPosition
                onLayout={(e) => {
                    const composerLayoutHeight = e.nativeEvent.layout.height;
                    if (composerHeight === composerLayoutHeight) {
                        return;
                    }
                    setComposerHeight(composerLayoutHeight);
                }}
                onScroll={updateShouldShowSuggestionMenuToFalse}
            />
        </View>
    );
}

export default SoloComposer;
