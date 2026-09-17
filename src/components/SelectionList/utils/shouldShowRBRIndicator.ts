import type {ListItem} from '@components/SelectionList/ListItem/types';

import isListItemSelected from './isListItemSelected';

/** Whether a row should show its brick road indicator. */
function shouldShowRBRIndicator<TItem extends ListItem>(item: TItem, isSelected?: boolean): boolean {
    return !!item.brickRoadIndicator && (!isListItemSelected(item, isSelected) || !!item.canShowSeveralIndicators);
}

export default shouldShowRBRIndicator;
