import type {DraggableListRenderItemParams} from '@components/DraggableList/types';
import type {SearchCustomColumnIds} from '@components/Search/types';
import type {ListItemProps} from '@components/SelectionList/ListItem/types';

import type React from 'react';

type ColumnItem = {
    text: string;
    value: SearchCustomColumnIds;
    keyForList: SearchCustomColumnIds;
    isSelected: boolean;
    isDisabled: boolean;
    isDragDisabled: boolean;
    leftElement: React.JSX.Element;
};

type ColumnsSettingsListItemProps = Pick<DraggableListRenderItemParams<ColumnItem>, 'item' | 'isFocused' | 'drag' | 'isActive'> & {
    onSelectRow: ListItemProps<ColumnItem>['onSelectRow'];

    /** Omitted when this row is already first or cannot be reordered. */
    onMoveUp?: () => void;

    /** Omitted when the next row is unselected or this row cannot be reordered. */
    onMoveDown?: () => void;
};

export type {ColumnItem, ColumnsSettingsListItemProps};
