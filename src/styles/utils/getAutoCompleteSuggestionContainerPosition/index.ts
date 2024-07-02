import type {ViewStyle} from 'react-native';

/**
 * Gets the correct position for auto complete suggestion container
 */
export default function getAutoCompleteSuggestionContainerPosition(
    height: number,
    suggestionsPadding: number,
    shouldBeDisplayedBelowParentContainer: boolean,
    borderWidth: number,
    shouldPreventScroll: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _containerHeight: number,
): ViewStyle {
    return {
        top: -(height + (shouldBeDisplayedBelowParentContainer ? -2 : 1) * (suggestionsPadding + (shouldPreventScroll ? 0 : borderWidth))),
    };
}
