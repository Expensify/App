import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';
import type {ComposerRef, TextSelection} from '@components/Composer/types';

import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';

// eslint-disable-next-line no-restricted-imports
import findNodeHandle from '@src/utils/findNodeHandle';

import type {RefObject} from 'react';
import type {MeasureInWindowOnSuccessCallback, TextInputScrollEvent} from 'react-native';

import {useEffect, useRef} from 'react';
import {useFocusedInputHandler} from 'react-native-keyboard-controller';
import {useSharedValue} from 'react-native-reanimated';

import type {SuggestionsRef} from './ComposerContext';

import getCursorPosition from './getCursorPosition';
import getScrollPosition from './getScrollPosition';

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
    const cursorPositionValue = useSharedValue({x: 0, y: 0});
    const tag = useSharedValue(-1);

    useEffect(() => {
        // We use the tag to store the native ID of the text input. Later, we use it in onSelectionChange to pick up the proper text input data.
        tag.set(findNodeHandle(composerRef.current) ?? -1);
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
