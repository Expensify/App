import {isRecord} from '@libs/ObjectUtils';

import type {LegendListRef} from '@legendapp/list/react-native';

/**
 * LegendList uses paint containment for web item containers, which clips descendants that render
 * outside their row. Remove only paint containment so inline menus can overflow while layout and
 * style containment keep the rest of the row isolated.
 */
function allowLegendListItemOverflow(list: LegendListRef | null, index: number): void {
    const itemContainer: unknown = list?.getState().elementAtIndex(index);
    if (!isRecord(itemContainer) || !isRecord(itemContainer.style) || typeof itemContainer.style.contain !== 'string') {
        return;
    }

    itemContainer.style.contain = 'layout style';
}

export default allowLegendListItemOverflow;
