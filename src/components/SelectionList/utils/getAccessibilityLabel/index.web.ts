import type {ListItem} from '@components/SelectionList/ListItem/types';

function getAccessibilityLabel<TItem extends ListItem>(item: TItem, isSelected?: boolean): string {
    const baseLabel = item.accessibilityLabel ?? (item.text === item.alternateText ? (item.text ?? '') : [item.text, item.alternateText].filter(Boolean).join(', '));

    if (isSelected === undefined) {
        return baseLabel;
    }

    // Screen readers inconsistently announce aria-selected on role="option" elements,
    // so we embed the selection state directly in the accessible label as a reliable workaround.
    return isSelected ? `${baseLabel}, selected` : `${baseLabel}`;
}

export default getAccessibilityLabel;
