import {ReactElement} from 'react';
import type {Icon} from '@src/types/onyx/OnyxCommon';

// TODO: remove when MentionSuggestions will be merged
type Mention = {
    /** Display name of the user */
    text: string;

    /** Email/phone number of the user */
    alternateText: string;

    /** Array of icons of the user. We use the first element of this array */
    icons: Icon[];
};

// TODO: remove when EmojiSuggestions will be merged
type SimpleEmoji = {
    code: string;
    name: string;
    types?: string[];
};

type Suggestion = Mention | SimpleEmoji;

type MeasureParentContainerCallback = (x: number, y: number, width: number) => void;

type AutoCompleteSuggestionsProps = {
    /** Array of suggestions */
    suggestions: Suggestion[];

    /** Function used to render each suggestion, returned JSX will be enclosed inside a Pressable component */
    renderSuggestionMenuItem: (item: Suggestion, index: number) => ReactElement;

    /** Create unique keys for each suggestion item */
    keyExtractor: () => string;

    /** The index of the highlighted suggestion */
    highlightedSuggestionIndex: number;

    /** Fired when the user selects a suggestion */
    onSelect: (index: number) => void;

    /** Show that we can use large auto-complete suggestion picker.
     * Depending on available space and whether the input is expanded, we can have a small or large mention suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isSuggestionPickerLarge: boolean;

    /** create accessibility label for each item */
    accessibilityLabelExtractor: (item: Suggestion, index: number) => string;

    /** Meaures the parent container's position and dimensions. */
    measureParentContainer?: (callback: MeasureParentContainerCallback) => void;
};

export type {AutoCompleteSuggestionsProps, Suggestion};
