import type {MarkdownRange} from '@expensify/react-native-live-markdown';
import {parseExpensiMark} from '@expensify/react-native-live-markdown';
import {Str} from 'expensify-common';
import type {Extras} from 'expensify-common/dist/ExpensiMark';
import CONST from '@src/CONST';
import Parser from './Parser';
import {addSMSDomainIfPhoneNumber} from './PhoneNumber';

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
                // +1 because we want to skip `@` character from the mention value - ex: @mateusz -> mateusz
                const mentionValue = text.slice(range.start + 1, range.start + range.length);

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
                const mentionValue = text.slice(range.start + 1, range.start + range.length);

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

    const parsedRanges = parseExpensiMark(text);
    return decorateRangesWithShortMentions(parsedRanges, text, availableMentions, currentUserMentions);
}

/**
 * Adds a domain to a short mention, converting it into a full mention with email or SMS domain.
 * @returns The converted mention as a full mention string or undefined if conversion is not applicable.
 */
function addDomainToShortMention(mention: string, availableMentionLogins: string[], userPrivateDomain?: string): string | undefined {
    if (!Str.isValidEmail(mention) && userPrivateDomain) {
        const mentionWithEmailDomain = `${mention}@${userPrivateDomain}`;
        if (availableMentionLogins.includes(mentionWithEmailDomain)) {
            return mentionWithEmailDomain;
        }
    }
    if (Str.isValidE164Phone(mention)) {
        const mentionWithSmsDomain = addSMSDomainIfPhoneNumber(mention);
        if (availableMentionLogins.includes(mentionWithSmsDomain)) {
            return mentionWithSmsDomain;
        }
    }
    return undefined;
}

type GetParsedMessageWithShortMentionsArgs = {
    text: string;
    availableMentionLogins: string[];
    userEmailDomain?: string;
    parserOptions: {
        disabledRules?: string[];
        extras?: Extras;
    };
};

/**
 * This function receives raw text of the message, parses it with ExpensiMark, then transforms short-mentions
 * into full mentions by adding a user domain to them.
 * It returns a message text that can be safely sent to backend, with mentions handled.
 *
 * Detailed info:
 * The backend allows only 2 kinds of mention tags: <mention-here> and <mention-user>.
 * However, ExpensiMark can also produce a special `<mention-short>` tag, which is just the @login part of a full user login.
 * This is handled inside `react-native-live-markdown` with a special function `parseExpensiMark` and then processed with `decorateRangesWithShortMentions`.
 * However, we cannot use `parseExpensiMark` for the text that is being sent to backend, as we need html mention tags.
 * This function is the missing piece that will use ExpensiMark for parsing, but will also strip+transform `mention-short` into full mentions.
 */
function getParsedMessageWithShortMentions({text, availableMentionLogins, userEmailDomain, parserOptions}: GetParsedMessageWithShortMentionsArgs) {
    const parsedText = Parser.replace(text, {
        shouldEscapeText: true,
        disabledRules: parserOptions.disabledRules,
        extras: parserOptions.extras,
    });

    const textWithHandledMentions = parsedText.replaceAll(CONST.REGEX.SHORT_MENTION_HTML, (fullMatch, group1) => {
        // Casting here is safe since our logic guarantees that if regex matches we will get group1 as non-empty string
        const shortMention = group1 as string;
        if (!Str.isValidMention(shortMention)) {
            return shortMention;
        }

        const loginPart = shortMention.substring(1);
        const mentionWithDomain = addDomainToShortMention(loginPart, availableMentionLogins, userEmailDomain);
        return mentionWithDomain ? `<mention-user>@${mentionWithDomain}</mention-user>` : shortMention;
    });

    return textWithHandledMentions;
}

export {parseExpensiMarkWithShortMentions, decorateRangesWithShortMentions, addDomainToShortMention, getParsedMessageWithShortMentions};
