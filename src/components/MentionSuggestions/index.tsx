import AutoCompleteSuggestions from '@components/AutoCompleteSuggestions';
import type {MeasureParentContainerAndCursorCallback} from '@components/AutoCompleteSuggestions/types';

import React from 'react';

import type Mention from './types';

import MentionSuggestionItem from './MentionSuggestionItem';

type MentionSuggestionsProps = {
    /** The index of the highlighted mention */
    highlightedMentionIndex?: number;

    /** Array of suggested mentions */
    mentions: Mention[];

    /** Fired when the user selects a mention */
    onSelect: (highlightedMentionIndex: number) => void;

    /** Mention prefix that follows the @ sign  */
    prefix: string;

    /** Show that we can use large mention picker.
     * Depending on available space and whether the input is expanded, we can have a small or large mention suggester.
     * When this value is false, the suggester will have a height of 2.5 items. When this value is true, the height can be up to 5 items.  */
    isMentionPickerLarge: boolean;

    /** Measures the parent container's position and dimensions. Also add cursor coordinates */
    measureParentContainerAndReportCursor: (callback: MeasureParentContainerAndCursorCallback) => void;

    /** Reset the emoji suggestions */
    resetSuggestions: () => void;
};

/**
 * Create unique keys for each mention item
 */
const keyExtractor = (item: Mention) => item.alternateText;

function MentionSuggestions({
    prefix,
    mentions,
    highlightedMentionIndex = 0,
    onSelect,
    isMentionPickerLarge,
    measureParentContainerAndReportCursor = () => {},
    resetSuggestions,
}: MentionSuggestionsProps) {
    return (
        <AutoCompleteSuggestions
            suggestions={mentions}
            renderSuggestionMenuItem={(item: Mention) => (
                <MentionSuggestionItem
                    item={item}
                    prefix={prefix}
                />
            )}
            keyExtractor={keyExtractor}
            highlightedSuggestionIndex={highlightedMentionIndex}
            onSelect={onSelect}
            isSuggestionPickerLarge={isMentionPickerLarge}
            accessibilityLabelExtractor={keyExtractor}
            measureParentContainerAndReportCursor={measureParentContainerAndReportCursor}
            resetSuggestions={resetSuggestions}
        />
    );
}

export default MentionSuggestions;
