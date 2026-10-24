import type {DraggableListRenderItemParams} from '@components/DraggableList/types';
import type {SearchCustomColumnIds} from '@components/Search/types';
import type {ListItemProps} from '@components/SelectionList/ListItem/types';

import type React from 'react';

type ColumnItem = {
    /** Localized column label, also used as the screen reader name. */
    text: string;

    /** Column ID passed back when a row is reordered. */
    value: SearchCustomColumnIds;

    /** Stable row key matching the column ID. */
    keyForList: SearchCustomColumnIds;

    /** Selected columns appear before the alphabetically ordered unselected columns. */
    isSelected: boolean;

    /** Required fields cannot be deselected, but can still be reordered. */
    isDisabled: boolean;

    /** Unselected columns remain visible without becoming drop targets. */
    isDragDisabled: boolean;

    /** Drag icon wrapped in a touch target by the native variant. */
    leftElement: React.JSX.Element;
};

type ColumnsSettingsListItemProps = Pick<DraggableListRenderItemParams<ColumnItem>, 'item' | 'isFocused' | 'drag' | 'isActive'> & {
    /** Toggles optional columns without changing the selection of required columns. */
    onSelectRow: ListItemProps<ColumnItem>['onSelectRow'];

    /** Omitted when this row is already first or cannot be reordered. */
    onMoveUp?: () => void;

    /** Omitted when the next row is unselected or this row cannot be reordered. */
    onMoveDown?: () => void;
};

export type {ColumnItem, ColumnsSettingsListItemProps};
