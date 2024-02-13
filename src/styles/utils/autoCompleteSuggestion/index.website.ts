import type {ViewStyle} from 'react-native';
import * as Browser from '@libs/Browser';
import CONST from '@src/CONST';

const isMobileSafari = Browser.isMobileSafari();

function getAutoCompleteSuggestionContainerStyle(itemsHeight: number): ViewStyle {
    'worklet';

    const borderWidth = 2;
    let height = itemsHeight + 2 * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING;
    let top = -(height + CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_PADDING);

    if (isMobileSafari) {
        top += borderWidth;
    } else {
        height += borderWidth;
    }

    // The suggester is positioned absolutely within the component that includes the input and RecipientLocalTime view (for non-expanded mode only). To position it correctly,
    // we need to shift it by the suggester's height plus its padding and, if applicable, the height of the RecipientLocalTime view.
    return {
        overflow: 'hidden',
        top,
        height,
        minHeight: CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT,
    };
}

export default getAutoCompleteSuggestionContainerStyle;
