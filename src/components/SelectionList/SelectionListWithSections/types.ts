import type {ReactNode} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {BaseSelectionListProps} from '@components/SelectionList/types';
import type CONST from '@src/CONST';

type Section<TItem extends ListItem> = {
    /** Title of the section */
    title?: string;

    /** Array of items in the section */
    data?: TItem[];

    /** Whether this section is disabled */
    isDisabled?: boolean;
};

/**
 * Props for SelectionListWithSections component.
 * Extends BaseSelectionListProps with section-specific features.
 */
type SelectionListWithSectionsProps<TItem extends ListItem> = BaseSelectionListProps<TItem> & {
    /** Reference to the SelectionList component */
    ref?: React.Ref<SelectionListWithSectionsHandle>;

    /** Array of sections to display in the list */
    sections: Array<Section<TItem>>;

    /** Custom content to display in the header */
    customHeaderContent?: ReactNode;

    /** Whether to hide the keyboard when scrolling the list */
    shouldHideKeyboardOnScroll?: boolean;

    /** Callback to fire when the list is scrolled */
    onScroll?: () => void;
};

type SelectionListWithSectionsHandle = {
    focusTextInput: () => void;
};

type SectionHeader = {
    type: typeof CONST.SECTION_LIST_ITEM_TYPE.HEADER;
    title: string;
    keyForList: string;
    isDisabled: boolean;
};

type SectionListItem<TItem extends ListItem> = TItem & {
    flatIndex: number;
    type: typeof CONST.SECTION_LIST_ITEM_TYPE.ROW;
    /** Unique key for FlashList rendering, containing section info  */
    flatListKey: string;
};

type FlattenedItem<TItem extends ListItem> = SectionListItem<TItem> | SectionHeader;

export type {Section, ListItem, SectionListItem, SelectionListWithSectionsProps, SelectionListWithSectionsHandle, SectionHeader, FlattenedItem};
