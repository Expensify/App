import type {ListItem} from '@components/SelectionList/ListItem/types';

/** Whether a row should show its brick road indicator. */
function shouldShowRBRIndicator<TItem extends ListItem>(item: TItem): boolean {
    return !!item.brickRoadIndicator && (!item.isSelected || !!item.canShowSeveralIndicators);
}

export default shouldShowRBRIndicator;
