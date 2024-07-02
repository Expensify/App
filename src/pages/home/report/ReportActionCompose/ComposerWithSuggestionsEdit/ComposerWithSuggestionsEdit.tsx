import type {Dispatch, ForwardedRef, RefObject, SetStateAction} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {findNodeHandle} from 'react-native';
import type {MeasureInWindowOnSuccessCallback, TextInput} from 'react-native';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import {useSharedValue} from 'react-native-reanimated';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import Composer from '@components/Composer';
import type {ComposerProps, TextSelection} from '@components/Composer/types';
import getCursorPosition from '@pages/home/report/ReportActionCompose/getCursorPosition';
import getScrollPosition from '@pages/home/report/ReportActionCompose/getScrollPosition';
import type {SuggestionsRef} from '@pages/home/report/ReportActionCompose/ReportActionCompose';
import Suggestions from '@pages/home/report/ReportActionCompose/Suggestions';

type ComposerWithSuggestionsEditProps = ComposerProps & {
    setValue: Dispatch<SetStateAction<string>>;
    setSelection: Dispatch<SetStateAction<TextSelection>>;
    resetKeyboardInput: () => void;
    isComposerFocused: boolean;
    suggestionsRef: RefObject<SuggestionsRef>;
    updateDraft: (newValue: string) => void;
    measureParentContainer: (callback: MeasureInWindowOnSuccessCallback) => void;
    value: string;
    selection: TextSelection;
    isGroupPolicyReport: boolean;
    policyID?: string;
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
        policyID,
    }: ComposerWithSuggestionsEditProps,
    ref: ForwardedRef<TextInput>,
) {
    const [composerHeight, setComposerHeight] = useState(0);
    const mobileInputScrollPosition = useRef(0);
    const textInputRef = useRef<TextInput | null>(null);
    const cursorPositionValue = useSharedValue({x: 0, y: 0});
    const tag = useSharedValue(-1);

    const measureParentContainerAndReportCursor = useCallback(
        (callback: MeasureParentContainerAndCursorCallback) => {
            const {scrollValue} = getScrollPosition({mobileInputScrollPosition, textInputRef});
            const {x: xPosition, y: yPosition} = getCursorPosition({positionOnMobile: cursorPositionValue.value, positionOnWeb: selection});
            measureParentContainer((x, y, width, height) => {
                callback({
                    x,
                    y,
                    width,
                    height,
                    scrollValue,
                    cursorCoordinates: {x: xPosition, y: yPosition},
                });
            });
        },
        [measureParentContainer, cursorPositionValue, selection],
    );

    useEffect(() => {
        tag.value = findNodeHandle(textInputRef.current) ?? -1;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useFocusedInputHandler(
        {
            onSelectionChange: (event) => {
                'worklet';

                if (event.target === tag.value) {
                    cursorPositionValue.value = {
                        x: event.selection.end.x,
                        y: event.selection.end.y,
                    };
                }
            },
        },
        [],
    );

    return (
        <>
            <Composer
                multiline
                ref={(el: TextInput) => {
                    textInputRef.current = el;
                    if (typeof ref === 'function') {
                        ref(el);
                    } else if (ref && 'current' in ref) {
                        // eslint-disable-next-line no-param-reassign
                        ref.current = el;
                    }
                }}
                id={id}
                onChangeText={onChangeText}
                onKeyPress={onKeyPress}
                value={value}
                maxLines={maxLines}
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
                shouldCalculateCaretPosition
            />

            <Suggestions
                ref={suggestionsRef}
                isComposerFocused={isComposerFocused}
                updateComment={updateDraft}
                measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
                isGroupPolicyReport={isGroupPolicyReport}
                policyID={policyID}
                value={value}
                setValue={setValue}
                selection={selection}
                setSelection={setSelection}
                resetKeyboardInput={resetKeyboardInput}
            />
        </>
    );
}

export default React.forwardRef(ComposerWithSuggestionsEdit);
