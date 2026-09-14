import type {LegendListRef} from '@legendapp/list/react-native';

/**
 * LegendList uses paint containment for web item containers, which clips descendants that render
 * outside their row. Remove only paint containment so inline menus can overflow while layout and
 * style containment keep the rest of the row isolated.
 */
function allowLegendListItemOverflow(list: LegendListRef | null, index: number): boolean {
    const itemContainer: unknown = list?.getState().elementAtIndex(index);
    if (!isRecord(itemContainer) || !isRecord(itemContainer.style) || typeof itemContainer.style.contain !== 'string') {
        return false;
    }

    itemContainer.style.contain = 'layout style';
    return true;
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
    return typeof value === 'object' && value !== null;
}

export default allowLegendListItemOverflow;
