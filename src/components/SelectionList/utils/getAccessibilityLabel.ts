import type {ListItem} from '@components/SelectionList/ListItem/types';

function getAccessibilityLabel<TItem extends ListItem>(item: TItem) {
    if (item.accessibilityLabel) {
        return item.accessibilityLabel;
    }

    const defaultAccessibilityLabel = item.text === item.alternateText ? (item.text ?? '') : [item.text, item.alternateText].filter(Boolean).join(', ');

    return defaultAccessibilityLabel;
}

export default getAccessibilityLabel;
