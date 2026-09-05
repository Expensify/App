import type {Emoji} from '@assets/emojis/types';

import AutoCompleteSuggestions from '@components/AutoCompleteSuggestions';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';

import React from 'react';

import EmojiSuggestionItem from './EmojiSuggestionItem';

type EmojiSuggestionsProps = {
    /** The index of the highlighted emoji */
    highlightedEmojiIndex?: number;

    /** Array of suggested emoji */
    emojis: Emoji[];

    /** Fired when the user selects an emoji */
    onSelect: (index: number) => void;

    /** Emoji prefix that follows the colon */
    prefix: string;

    /** Show that we can use large emoji picker. Depending on available space
     * and whether the input is expanded, we can have a small or large emoji
     * suggester. When this value is false, the suggester will have a height of
     * 2.5 items. When this value is true, the height can be up to 5 items.  */
    isEmojiPickerLarge: boolean;

    /** Stores user's preferred skin tone */
    preferredSkinToneIndex: number;

    /** Measures the parent container's position and dimensions. Also add cursor coordinates */
    measureParentContainerAndReportCursor: (callback: MeasureParentContainerAndCursorCallback) => void;

    /** Reset the emoji suggestions */
    resetSuggestions: () => void;
};

/**
 * Create unique keys for each emoji item
 */
const keyExtractor = (item: Emoji, index: number): string => `${item.name}+${index}}`;

function EmojiSuggestions({
    emojis,
    onSelect,
    prefix,
    isEmojiPickerLarge,
    preferredSkinToneIndex,
    highlightedEmojiIndex = 0,
    measureParentContainerAndReportCursor = () => {},
    resetSuggestions,
}: EmojiSuggestionsProps) {
    return (
        <AutoCompleteSuggestions
            suggestions={emojis}
            renderSuggestionMenuItem={(item: Emoji) => (
                <EmojiSuggestionItem
                    item={item}
                    prefix={prefix}
                    preferredSkinToneIndex={preferredSkinToneIndex}
                />
            )}
            keyExtractor={keyExtractor}
            highlightedSuggestionIndex={highlightedEmojiIndex}
            onSelect={onSelect}
            isSuggestionPickerLarge={isEmojiPickerLarge}
            accessibilityLabelExtractor={keyExtractor}
            measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
            resetSuggestions={resetSuggestions}
        />
    );
}

export default EmojiSuggestions;
