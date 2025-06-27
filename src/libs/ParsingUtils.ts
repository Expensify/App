import type {MarkdownRange} from '@expensify/react-native-live-markdown';
import {parseExpensiMark} from '@expensify/react-native-live-markdown';

/**
 * Handles possible short mentions inside ranges by verifying if the specific range refers to a user mention/login
 * that is available in passed `availableMentions` list. If yes, then it gets the same styling as normal email mention.
 * In addition, applies special styling to current user.
 */
function decorateRangesWithShortMentions(ranges: MarkdownRange[], text: string, availableMentions: string[], currentUserMentions?: string[]): MarkdownRange[] {
    'worklet';

    return ranges
        .map((range) => {
            if (range.type === 'mention-short') {
                const mentionValue = text.slice(range.start, range.start + range.length);

                if (currentUserMentions?.includes(mentionValue)) {
                    return {
                        ...range,
                        type: 'mention-here',
                    };
                }

                if (availableMentions.includes(mentionValue)) {
                    return {
                        ...range,
                        type: 'mention-user',
                    };
                }

                // If it's neither, we remove the range since no styling will be needed
                return;
            }

            // Iterate over full mentions and see if any is a self mention
            if (range.type === 'mention-user') {
                const mentionValue = text.slice(range.start, range.start + range.length);

                if (currentUserMentions?.includes(mentionValue)) {
                    return {
                        ...range,
                        type: 'mention-here',
                    };
                }
            }
            return range;
        })
        .filter((maybeRange): maybeRange is MarkdownRange => !!maybeRange);
}

function parseExpensiMarkWithShortMentions(text: string, availableMentions: string[], currentUserMentions?: string[]) {
    'worklet';

    // Check if the text contains mermaid chart syntax
    // If it does, we skip live markdown processing since mermaid charts don't need markdown styling
    if (text.includes('```mermaid')) {
        return [];
    }
    
    try {
        const parsedRanges = parseExpensiMark(text);
        return decorateRangesWithShortMentions(parsedRanges, text, availableMentions, currentUserMentions);
    } catch (error) {
        // If parsing fails (e.g., due to unknown tags), return empty ranges
        console.warn('parseExpensiMark failed, returning empty ranges:', error);
        return [];
    }
}

export {parseExpensiMarkWithShortMentions, decorateRangesWithShortMentions};
