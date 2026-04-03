import {useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {BlurEvent, View} from 'react-native';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import type {SuggestionsRef} from './ComposerContext';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

type UseComposerFocusParams = {
    composerRef: RefObject<ComposerRef | null>;
    suggestionsRef: RefObject<SuggestionsRef | null>;
    actionButtonRef: RefObject<View | HTMLDivElement | null>;
    initialFocused: boolean;
};

function useComposerFocus({composerRef, suggestionsRef, actionButtonRef, initialFocused}: UseComposerFocusParams) {
    const [isFocused, setIsFocused] = useState(initialFocused);
    const isKeyboardVisibleWhenShowingModalRef = useRef(false);
    const isNextModalWillOpenRef = useRef(false);

    const focus = () => {
        if (composerRef.current === null) {
            return;
        }
        composerRef.current?.focus(true);
    };

    const onAddActionPressed = () => {
        if (!willBlurTextInputOnTapOutside) {
            isKeyboardVisibleWhenShowingModalRef.current = !!composerRef.current?.isFocused();
        }
        composerRef.current?.blur();
    };

    const onItemSelected = () => {
        isKeyboardVisibleWhenShowingModalRef.current = false;
    };

    const onTriggerAttachmentPicker = () => {
        isNextModalWillOpenRef.current = true;
        isKeyboardVisibleWhenShowingModalRef.current = true;
    };

    const onBlur = (event: BlurEvent) => {
        const webEvent = event as unknown as FocusEvent;
        setIsFocused(false);
        if (suggestionsRef.current) {
            suggestionsRef.current.resetSuggestions();
        }
        if (webEvent.relatedTarget && webEvent.relatedTarget === actionButtonRef.current) {
            isKeyboardVisibleWhenShowingModalRef.current = true;
        }
    };

    const onFocus = () => {
        setIsFocused(true);
    };

    return {isFocused, onBlur, onFocus, focus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker, isNextModalWillOpenRef};
}

export default useComposerFocus;
