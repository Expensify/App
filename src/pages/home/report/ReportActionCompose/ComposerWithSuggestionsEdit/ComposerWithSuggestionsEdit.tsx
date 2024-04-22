import type {Dispatch, ForwardedRef, RefObject, SetStateAction} from 'react';
import React, {useState} from 'react';
import type {MeasureInWindowOnSuccessCallback, TextInput} from 'react-native';
import Composer from '@components/Composer';
import type {ComposerProps} from '@components/Composer/types';
import type {SuggestionsRef} from '@pages/home/report/ReportActionCompose/ReportActionCompose';
import Suggestions from '@pages/home/report/ReportActionCompose/Suggestions';

type Selection = {
    start: number;
    end: number;
};

type ComposerWithSuggestionsEditProps = ComposerProps & {
    setValue: Dispatch<SetStateAction<string>>;
    setSelection: Dispatch<SetStateAction<Selection>>;
    resetKeyboardInput: () => void;
    isComposerFocused: boolean;
    suggestionsRef: RefObject<SuggestionsRef>;
    updateDraft: (newValue: string) => void;
    measureParentContainer: (callback: MeasureInWindowOnSuccessCallback) => void;
    value: string;
    selection: Selection;
    isGroupPolicyReport: boolean;
};

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
        id = undefined,
        isGroupPolicyReport,
    }: ComposerWithSuggestionsEditProps,
    ref: ForwardedRef<TextInput>,
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
                isGroupPolicyReport={isGroupPolicyReport}
            />
        </>
    );
}

export default React.forwardRef(ComposerWithSuggestionsEdit);
