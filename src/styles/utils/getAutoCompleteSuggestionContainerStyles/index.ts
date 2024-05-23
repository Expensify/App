import type {ViewStyle} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import shouldPreventScrollOnAutoCompleteSuggestion from '@styles/utils/autoCompleteSuggestion';
import CONST from '@src/CONST';

const shouldPreventScroll = shouldPreventScrollOnAutoCompleteSuggestion();

/**
 * Gets the correct position for auto complete suggestion container
 */
export default function getAutoCompleteSuggestionContainerStyles(
    itemsHeight: number,
    shouldBeDisplayedBelowParentContainer: boolean,
    isEditComposer: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _containerHeight: number,
): ViewStyle {
    'worklet';

    const borderWidth = 2;
    const height = itemsHeight + 2 * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING + (shouldPreventScroll ? borderWidth : 0);
    const suggestionsPadding = isEditComposer ? CONST.AUTO_COMPLETE_SUGGESTER.EDIT_SUGGESTER_PADDING : CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_PADDING;

    // The suggester is positioned absolutely within the component that includes the input and RecipientLocalTime view (for non-expanded mode only). To position it correctly,
    // we need to shift it by the suggester's height plus its padding and, if applicable, the height of the RecipientLocalTime view.
    return {
        overflow: 'hidden',
        top: -(height + (shouldBeDisplayedBelowParentContainer ? -2 : 1) * (suggestionsPadding + (shouldPreventScroll ? 0 : borderWidth))),
        height,
        minHeight: CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT,
    };
}
