import type {Bounds} from '@src/types/utils/Layout';

import type {ReactElement} from 'react';

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
    suggestions: TSuggestion[];

    /** Function used to render each suggestion, returned JSX will be enclosed inside a Pressable component */
    renderSuggestionMenuItem: (item: TSuggestion, index: number) => ReactElement;

    keyExtractor: (item: TSuggestion, index: number) => string;
    highlightedSuggestionIndex: number;

    /** Fired when the user selects a suggestion */
    onSelect: (index: number) => void;

    /** Show that we can use large auto-complete suggestion picker.
     * Depending on available space and whether the input is expanded, we can have a small or large mention suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isSuggestionPickerLarge: boolean;

    accessibilityLabelExtractor: (item: TSuggestion, index: number) => string;

    /** Measures the parent container's position and dimensions. Also add a cursor coordinates */
    measureParentContainerAndReportCursor?: (props: MeasureParentContainerAndCursorCallback) => void;

    /** Reset the emoji suggestions */
    resetSuggestions?: () => void;
};

export type {AutoCompleteSuggestionsProps, RenderSuggestionMenuItemProps, MeasureParentContainerAndCursorCallback, MeasureParentContainerAndCursor};
