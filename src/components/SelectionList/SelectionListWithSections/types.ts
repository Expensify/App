import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {BaseSelectionListProps} from '@components/SelectionList/types';

import type CONST from '@src/CONST';

import type {ReactElement, ReactNode} from 'react';
import type {LayoutChangeEvent, ScrollViewProps} from 'react-native';

type Section<TItem extends ListItem> = {
    title?: string;
    customHeader?: ReactElement;

    /** Array of items in the section */
    data: TItem[];

    /** Whether this section is disabled */
    isDisabled?: boolean;

    /** Index of the section, used to create a unique flatListKey */
    sectionIndex: number;
};

/**
 * Props for SelectionListWithSections component.
 * Extends BaseSelectionListProps with section-specific features.
 */
type SelectionListWithSectionsProps<TItem extends ListItem> = BaseSelectionListProps<TItem> & {
    ref?: React.Ref<SelectionListWithSectionsHandle>;
    sections: Array<Section<TItem>>;

    /** Index to scroll to initially (when different from the initially focused item) */
    initialScrollIndex?: number;

    customHeaderContent?: ReactNode;
    shouldHideKeyboardOnScroll?: boolean;
    onScroll?: () => void;
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Whether to prevent auto-scrolling to the first index when selecting an item in multi-select mode */
    shouldPreventAutoScrollOnSelect?: boolean;

    /** Whether to wrap long text in rows */
    isRowMultilineSupported?: boolean;

    /** Number of lines to show for title text when multiline is supported */
    titleNumberOfLines?: number;

    /**
     * Passed straight to the underlying list. Defaults to `always`, which a list whose own text input drives its
     * rows needs: a row press has to land while that input still holds focus. A list whose rows are inputs of their
     * own (the expense confirmation form) passes `handled` instead, so a tap that no row claims dismisses the
     * keyboard the way a tap outside a field is expected to.
     */
    keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
};

type MeasurableInput = unknown;

type SelectionListWithSectionsHandle<TItem extends ListItem = ListItem> = {
    focusTextInput: () => void;
    scrollToIndex: (index: number) => void;
    clearInputAfterSelect: () => void;
    updateAndScrollToFocusedIndex: (index: number, shouldScroll?: boolean) => void;
    updateExternalTextInputFocus: (isTextInputFocused: boolean) => void;
    getFocusedOption: () => TItem | undefined;

    /** Scrolls the list so an input rendered inside `listFooterContent` is not hidden behind the keyboard. */
    scrollInputIntoView: (input: MeasurableInput) => void;
};

type SectionHeader = {
    type: typeof CONST.SECTION_LIST_ITEM_TYPE.HEADER;
    keyForList: string;
    title?: string;
    customHeader?: ReactElement;
    isDisabled: boolean;
};

type SectionListItem<TItem extends ListItem> = TItem & {
    flatIndex: number;
    type: typeof CONST.SECTION_LIST_ITEM_TYPE.ROW;
    /** Unique key for FlashList rendering, containing section info  */
    flatListKey: string;
};

type FlattenedItem<TItem extends ListItem> = SectionListItem<TItem> | SectionHeader;

export type {Section, ListItem, SectionListItem, SelectionListWithSectionsProps, SelectionListWithSectionsHandle, FlattenedItem, MeasurableInput};
