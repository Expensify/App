import type {ListItem} from '@components/SelectionList/ListItem/types';

/**
 * Resolves a row's selected state. Selection can be provided explicitly (e.g. rows whose selection
 * isn't stored on the item) and otherwise falls back to the item.
 */
function isListItemSelected<TItem extends ListItem>(item: TItem, isSelected?: boolean): boolean {
    return isSelected ?? item.isSelected ?? false;
}

export default isListItemSelected;
