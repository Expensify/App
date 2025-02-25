import type {MarkdownRange} from '@expensify/react-native-live-markdown';

/**
 * Handles possible short mentions inside ranges by verifying if the specific range refers to a user mention/login
 * that is available in passed `availableMentions` list. If yes, then it gets the same styling as normal email mention.
 * In addition, applies special styling to current user.
 */
function decorateRangesWithShortMentions(ranges: MarkdownRange[], text: string, availableMentions: string[], currentUser?: string): MarkdownRange[] {
    'worklet';

    return ranges
        .map((range) => {
            if (range.type === 'mention-short') {
                const mentionText = text.slice(range.start, range.start + range.length);

                if (currentUser && mentionText === currentUser) {
                    return {
                        ...range,
                        type: 'mention-here',
                    };
                }

                if (availableMentions.includes(mentionText)) {
                    return {
                        ...range,
                        type: 'mention-user',
                    };
                }

                // If it's neither, we remove the range since no styling will be needed
                return;
            }
            return range;
        })
        .filter((maybeRange): maybeRange is MarkdownRange => !!maybeRange);
}

// eslint-disable-next-line import/prefer-default-export
export {decorateRangesWithShortMentions};
