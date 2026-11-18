import type {ListItem} from '@components/SelectionList/types';

type ColumnsSettingsListItemProps = {
    item: ListItem;
    isFocused?: boolean;
    onSelectRow: (item: ListItem) => void;
    drag?: () => void;
    position: number;
    selectedCount: number;
    moveUp?: () => number;
    moveDown?: () => number;
};

export default ColumnsSettingsListItemProps;
