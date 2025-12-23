import type {ReactElement} from 'react';
import type {Bounds} from '@src/types/utils/Layout';

type MeasureParentContainerAndCursor = Bounds & {
    scrollValue: number;
    cursorCoordinates: {x: number; y: number};
};

type MeasureParentContainerAndCursorCallback = (props: MeasureParentContainerAndCursor) => void;

type RenderSuggestionMenuItemProps<TSuggestion> = {
    item: TSuggestion;
    index: number;
};

type AutoCompleteSuggestionsProps<TSuggestion> = {
    /** Array of suggestions */
    suggestions: TSuggestion[];

    /** Function used to render each suggestion, returned JSX will be enclosed inside a Pressable component */
    renderSuggestionMenuItem: (item: TSuggestion, index: number) => ReactElement;

    /** Create unique keys for each suggestion item */
    keyExtractor: (item: TSuggestion, index: number) => string;

    /** The index of the highlighted suggestion */
    highlightedSuggestionIndex: number;

    /** Fired when the user selects a suggestion */
    onSelect: (index: number) => void;

    /** Show that we can use large auto-complete suggestion picker.
     * Depending on available space and whether the input is expanded, we can have a small or large mention suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isSuggestionPickerLarge: boolean;

    /** create accessibility label for each item */
    accessibilityLabelExtractor: (item: TSuggestion, index: number) => string;

    /** Measures the parent container's position and dimensions. Also add a cursor coordinates */
    measureParentContainerAndReportCursor?: (props: MeasureParentContainerAndCursorCallback) => void;

    /** Reset the emoji suggestions */
    resetSuggestions?: () => void;
};

export type {AutoCompleteSuggestionsProps, RenderSuggestionMenuItemProps, MeasureParentContainerAndCursorCallback, MeasureParentContainerAndCursor};
