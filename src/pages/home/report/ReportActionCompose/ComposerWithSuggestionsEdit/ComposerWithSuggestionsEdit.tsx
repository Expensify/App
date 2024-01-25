import type { ComposerProps } from "@components/Composer/types";
import Composer from "@components/Composer";
import type { Dispatch, ForwardedRef, MutableRefObject, SetStateAction} from 'react';
import React, { useState } from 'react';
import type { AnimatedProps } from "react-native-reanimated";
import type {TextInputProps} from "react-native";
import Suggestions from '@pages/home/report/ReportActionCompose/Suggestions';
import type { SuggestionsRef } from "@pages/home/report/ReportActionCompose/types";

type ComposerWithSuggestionsEditProps = {
    setValue: Dispatch<SetStateAction<string>>,
    setSelection: Dispatch<SetStateAction<{
        start: number,
        end: number,
    }>>,
    resetKeyboardInput: () => void,
    isComposerFocused: boolean,
    suggestionsRef: MutableRefObject<SuggestionsRef | undefined>,
    updateDraft: (newValue: string) => void,
    measureParentContainer: (callback: () => void) => void
}


function ComposerWithSuggestionsEdit(
    {
        value,
        maxLines = -1,
        onKeyPress = () => {},
        style,
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
        updateDraft,
        measureParentContainer,
        id = undefined
    }: ComposerWithSuggestionsEditProps & ComposerProps,
    ref: ForwardedRef<React.Component<AnimatedProps<TextInputProps>>>,
) {
    const [composerHeight, setComposerHeight] = useState(0);

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
                // @ts-expect-error TODO: Remove this once Suggestions is migrated to TypeScript.
                isComposerFullSize={false}
                isComposerFocused={isComposerFocused}
                updateComment={updateDraft}
                composerHeight={composerHeight}
                measureParentContainer={measureParentContainer}
                isAutoSuggestionPickerLarge
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