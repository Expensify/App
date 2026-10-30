import type {DraggableListRenderItemParams} from '@components/DraggableList/types';
import type {SearchCustomColumnIds} from '@components/Search/types';
import type {ListItemProps} from '@components/SelectionList/ListItem/types';

import type React from 'react';

type ColumnItem = {
    /** Display label for the column, also used as its accessible name. */
    text: string;

    /** Column to update when the user changes its selection or position. */
    value: SearchCustomColumnIds;

    keyForList: SearchCustomColumnIds;

    /** The table shows only selected columns. */
    isSelected: boolean;

    /** Prevents deselection of required columns without preventing reordering. */
    isDisabled: boolean;

    /** Prevents reordering without disabling the selection checkbox. */
    isDragDisabled: boolean;

    /** Element rendered on the left side of the list item, such as a drag handle. */
    leftElement: React.JSX.Element;
};

type ColumnsSettingsListItemProps = Pick<DraggableListRenderItemParams<ColumnItem>, 'item' | 'isFocused' | 'drag' | 'isActive'> & {
    /** Changes whether the column appears in the table. */
    onSelectRow: ListItemProps<ColumnItem>['onSelectRow'];

    /** Moves the column before the previous selected column. Omit when that move is unavailable. */
    onMoveUp?: () => void;

    /** Moves the column after the next selected column. Omit when that move is unavailable. */
    onMoveDown?: () => void;
};

export type {ColumnItem, ColumnsSettingsListItemProps};
