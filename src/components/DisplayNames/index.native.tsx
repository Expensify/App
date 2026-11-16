import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';

import React from 'react';

import type DisplayNamesProps from './types';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames({
    accessibilityLabel,
    fullTitle,
    textStyles = [],
    numberOfLines = 1,
    renderAdditionalText,
    forwardedFSClass,
    testID,
    shouldParseFullTitle = true,
    isSelectable = false,
}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const titleContainsTextAndCustomEmoji = containsCustomEmoji(fullTitle) && !containsOnlyCustomEmoji(fullTitle);
    const processedTitle = shouldParseFullTitle ? Parser.htmlToText(fullTitle) : fullTitle;
    const title = StringUtils.lineBreaksToSpaces(processedTitle) || translate('common.hidden');

    return (
        <Text
            accessibilityLabel={accessibilityLabel}
            style={textStyles}
            numberOfLines={numberOfLines}
            testID={`DisplayNames${testID !== undefined ? `-${testID}` : ''}`}
            fsClass={forwardedFSClass}
            selectable={isSelectable}
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

export default DisplayNames;
