import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import type {ComposerRef, TextSelection} from '@components/Composer/types';

import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';

import type {TextInputScrollEvent} from '@src/types/utils/ReactNativeCompat';
// eslint-disable-next-line no-restricted-imports
import findNodeHandle from '@src/utils/findNodeHandle';

import type {RefObject} from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';

import {useEffect, useRef} from 'react';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import {useSharedValue} from 'react-native-reanimated';

import type {SuggestionsRef} from './ComposerContext';

import getCursorPosition from './getCursorPosition';
import getScrollPosition from './getScrollPosition';

type InputSize = {
    width: number;
    height: number;
};

/** Reads the input's size from a native scroll event, which carries it even though React Native's types leave it out */
function getInputSize(event: TextInputScrollEvent | undefined): InputSize | undefined {
    const nativeEvent = event?.nativeEvent;
    if (!nativeEvent || !('layoutMeasurement' in nativeEvent)) {
        return undefined;
    }
    const {layoutMeasurement} = nativeEvent;
    if (typeof layoutMeasurement !== 'object' || !layoutMeasurement || !('width' in layoutMeasurement) || !('height' in layoutMeasurement)) {
        return undefined;
    }
    const {width, height} = layoutMeasurement;
    if (typeof width !== 'number' || typeof height !== 'number') {
        return undefined;
    }
    return {width, height};
}

type UseComposerSuggestionsParams = {
    /** Ref to the composer input the suggestions are attached to */
    composerRef: RefObject<ComposerRef | null>;

    /** The current selection of the composer, used as the cursor position on web */
    selection: TextSelection;

    /** Measures the container the suggestion menu is positioned against */
    measureParentContainer: (callback: MeasureInWindowOnSuccessCallback) => void;

    /** Suggestions ref owned by a parent. When omitted, the hook owns the ref itself */
    suggestionsRef?: RefObject<SuggestionsRef | null>;
};

/**
 * Wires up everything a composer needs to render <Suggestions />
 */
function useComposerSuggestions({composerRef, selection, measureParentContainer, suggestionsRef: suggestionsRefProp}: UseComposerSuggestionsParams) {
    const ownSuggestionsRef = useRef<SuggestionsRef>(null);
    const suggestionsRef = suggestionsRefProp ?? ownSuggestionsRef;

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const mobileInputScrollPosition = useRef(0);
    const inputSizeRef = useRef<InputSize | undefined>(undefined);
    const cursorPositionValue = useSharedValue({x: 0, y: 0});
    const tag = useSharedValue(-1);

    useEffect(() => {
        // We use the tag to store the native ID of the text input. Later, we use it in onSelectionChange to pick up the proper text input data.
        const input = composerRef.current;
        tag.set(findNodeHandle(input && 'measure' in input ? input : null) ?? -1);
    }, [tag, composerRef]);

    useFocusedInputHandler(
        {
            onSelectionChange: (event) => {
                'worklet';

                if (event.target === tag.get()) {
                    cursorPositionValue.set({
                        x: event.selection.end.x,
                        y: event.selection.end.y,
                    });
                }
            },
        },
        [],
    );

    const measureParentContainerAndReportCursor = (callback: MeasureParentContainerAndCursorCallback) => {
        const {scrollValue} = getScrollPosition({mobileInputScrollPosition, textInputRef: composerRef});
        const {x: xPosition, y: yPosition} = getCursorPosition({positionOnMobile: cursorPositionValue.get(), positionOnWeb: selection});
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
    };

    const hideSuggestionMenu = () => {
        suggestionsRef.current?.updateShouldShowSuggestionMenuToFalse(false);
    };

    const onSaveScrollAndHideSuggestionMenu = (event: TextInputScrollEvent) => {
        // The offset is recorded even for a layout-triggered scroll, so the menu stays anchored to the real caret position.
        mobileInputScrollPosition.current = event?.nativeEvent?.contentOffset?.y ?? 0;

        // When the input is resized (e.g. its max lines change on rotation), the native input scrolls on its own to keep the caret
        // visible. That scroll isn't the user's, so it must not hide the menu. The size arrives with the scroll event itself,
        // because a rotation's scroll can reach JS before the re-render that applies the new max lines.
        const inputSize = getInputSize(event);
        const previousInputSize = inputSizeRef.current;
        inputSizeRef.current = inputSize;
        if (inputSize && previousInputSize && (inputSize.width !== previousInputSize.width || inputSize.height !== previousInputSize.height)) {
            raiseIsScrollLayoutTriggered();
        }

        if (isScrollLayoutTriggered.current) {
            return;
        }

        hideSuggestionMenu();
    };

    /** Forgets the tracked scroll offset, e.g. when the composer input is cleared and scrolled back to the top */
    const resetScrollPosition = () => {
        mobileInputScrollPosition.current = 0;
    };

    return {
        suggestionsRef,
        measureParentContainerAndReportCursor,
        hideSuggestionMenu,
        onSaveScrollAndHideSuggestionMenu,
        resetScrollPosition,
        raiseIsScrollLayoutTriggered,
    };
}

export default useComposerSuggestions;
