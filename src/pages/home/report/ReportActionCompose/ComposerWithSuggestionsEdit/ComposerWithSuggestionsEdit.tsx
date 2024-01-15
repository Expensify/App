import { ComposerProps } from "@components/Composer/types";
import Composer from "@components/Composer";
import React, { Dispatch, ForwardedRef, MutableRefObject, SetStateAction, useRef, useState } from 'react';
import { AnimatedProps } from "react-native-reanimated";
import { TextInputProps } from "react-native";
import Suggestions from '../Suggestions';
import lodashGet from 'lodash/get';
import * as SuggestionUtils from '@libs/SuggestionUtils';
import useWindowDimensions from "@hooks/useWindowDimensions";

type ComposerWithSuggestionsEditProps = {
    setValue: Dispatch<SetStateAction<string>>,
    setSelection: Dispatch<SetStateAction<{
        start: number,
        end: number,
    }>>,
    resetKeyboardInput: () => void,
    isComposerFocused: boolean,
    listHeight: number,
    suggestionsRef: MutableRefObject<HTMLElement | undefined>,
    updateDraft: (newValue: string) => void,
    measureParentContainer: (callback: () => void) => void
}


function ComposerWithSuggestionsEdit(
    {
        value,
        maxLines = -1,
        onKeyPress = () => {},
        style,
        numberOfLines: numberOfLinesProp = 0,
        onSelectionChange = () => {},
        selection = {
            start: 0,
            end: 0,
        },
        onBlur = () => {},
        onFocus = () => {},
        onChangeText = () => {},
        setValue = () => {},
        setSelection = () => {},
        resetKeyboardInput = () => {},
        isComposerFocused,
        suggestionsRef,
        listHeight,
        updateDraft,
        measureParentContainer,
        id = undefined
    }: ComposerWithSuggestionsEditProps & ComposerProps,
    ref: ForwardedRef<React.Component<AnimatedProps<TextInputProps>>>,
) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const suggestions = lodashGet(suggestionsRef, 'current.getSuggestions', () => [])();

    const [composerHeight, setComposerHeight] = useState(0);

    const hasEnoughSpaceForLargeSuggestion = SuggestionUtils.hasEnoughSpaceForLargeSuggestionMenu(listHeight, composerHeight, suggestions.length);

    console.log(hasEnoughSpaceForLargeSuggestion);

    const isAutoSuggestionPickerLarge = !isSmallScreenWidth || (isSmallScreenWidth && hasEnoughSpaceForLargeSuggestion);

    
    return (
        <>
            <Composer
                multiline
                ref={ref}
                id={id}
                onChangeText={onChangeText} // Debounced saveDraftComment
                onKeyPress={onKeyPress}
                value={value}
                maxLines={maxLines} // This is the same that slack has
                style={style}
                onFocus={onFocus}
                onBlur={onBlur}
                selection={selection}
                onSelectionChange={onSelectionChange}
                onLayout={(e) => {
                    const composerLayoutHeight = e.nativeEvent.layout.height;
                    if (composerHeight === composerLayoutHeight) {
                        return;
                    }
                    setComposerHeight(composerLayoutHeight);
                }}
            />

            <Suggestions
                ref={suggestionsRef}
                isComposerFullSize={false}
                isComposerFocused={isComposerFocused}
                updateComment={updateDraft}
                composerHeight={composerHeight}
                measureParentContainer={measureParentContainer}
                isAutoSuggestionPickerLarge={isAutoSuggestionPickerLarge}
                // Input
                value={value}
                setValue={setValue}
                selection={selection}
                setSelection={setSelection}
                resetKeyboardInput={resetKeyboardInput}
            />
        </>
        
    )
}

export default React.forwardRef(ComposerWithSuggestionsEdit);