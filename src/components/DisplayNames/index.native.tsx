import PlainText from '@components/PlainText';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';

import React, {useMemo} from 'react';

import type DisplayNamesProps from './types';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames({accessibilityLabel, fullTitle, textStyles = [], numberOfLines = 1, renderAdditionalText, forwardedFSClass, testID, shouldParseFullTitle = true}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const titleContainsTextAndCustomEmoji = useMemo(() => containsCustomEmoji(fullTitle) && !containsOnlyCustomEmoji(fullTitle), [fullTitle]);
    const title = useMemo(() => {
        const processedTitle = shouldParseFullTitle ? Parser.htmlToText(fullTitle) : fullTitle;
        return StringUtils.lineBreaksToSpaces(processedTitle) || translate('common.hidden');
    }, [fullTitle, shouldParseFullTitle, translate]);

    // Mixed emoji + text titles need nested Text runs (a per-fragment font size), so they stay on Text.
    // Plain string titles render on the native PlainText label; custom-emoji-only titles get the emoji font inside it.
    if (titleContainsTextAndCustomEmoji || renderAdditionalText) {
        return (
            <Text
                accessibilityLabel={accessibilityLabel}
                style={textStyles}
                numberOfLines={numberOfLines}
                testID={`DisplayNames${testID !== undefined ? `-${testID}` : ''}`}
                fsClass={forwardedFSClass}
            >
                {titleContainsTextAndCustomEmoji ? (
                    <TextWithEmojiFragment
                        message={title}
                        style={textStyles}
                    />
                ) : (
                    title
                )}
                {renderAdditionalText?.()}
            </Text>
        );
    }

    // forwardedFSClass is intentionally not forwarded: FullStory only applies fsClass on core RN components, not custom ones.
    return (
        <PlainText
            accessibilityLabel={accessibilityLabel}
            style={textStyles}
            numberOfLines={numberOfLines}
            testID={`DisplayNames${testID !== undefined ? `-${testID}` : ''}`}
        >
            {title}
        </PlainText>
    );
}

export default DisplayNames;
