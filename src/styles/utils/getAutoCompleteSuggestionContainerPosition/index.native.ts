import type {ViewStyle} from 'react-native';
import CONST from '@src/CONST';

/**
 * Gets the correct position for auto complete suggestion container
 */
export default function getAutoCompleteSuggestionContainerPosition(
    height: number,
    suggestionsPadding: number,
    shouldBeDisplayedBelowParentContainer: boolean,
    borderWidth: number,
    shouldPreventScroll: boolean,
    containerHeight: number,
): ViewStyle {
    return {
        top: shouldBeDisplayedBelowParentContainer
            ? containerHeight + CONST.AUTO_COMPLETE_SUGGESTER.EDIT_SUGGESTER_PADDING
            : -(height + (suggestionsPadding + (shouldPreventScroll ? 0 : borderWidth))),
    };
}
