import type {ListItem} from '@components/SelectionList/ListItem/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- isSelected is used only in the web version (index.web.ts) for label-based state announcement
function getAccessibilityLabel<TItem extends ListItem>(item: TItem, isSelected?: boolean): string {
    const baseLabel = item.accessibilityLabel ?? (item.text === item.alternateText ? (item.text ?? '') : [item.text, item.alternateText].filter(Boolean).join(', '));

    return baseLabel;
}

export default getAccessibilityLabel;
