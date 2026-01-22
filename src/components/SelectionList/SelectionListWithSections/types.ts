import type {ReactNode} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {BaseSelectionListProps} from '@components/SelectionList/types';

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
    ref?: React.Ref<SelectionWithSectionsListHandle>;

    /** Array of sections to display in the list */
    sections: Array<Section<TItem>>;

    /** Custom content to display in the header */
    customHeaderContent?: ReactNode;
};

type SelectionWithSectionsListHandle = {
    focusTextInput: () => void;
};

type SectionHeader = {
    type: 'header';
    title: string;
    keyForList: string;
    isDisabled: boolean;
};

type SectionListItem<TItem extends ListItem> = TItem & {flatIndex: number; type: 'row'};

type FlattenedItem<TItem extends ListItem> = SectionListItem<TItem> | SectionHeader;

export type {Section, ListItem, SectionListItem, SelectionListWithSectionsProps, SelectionWithSectionsListHandle, SectionHeader, FlattenedItem};
