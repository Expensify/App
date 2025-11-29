import React, {useMemo} from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';
import TextWithEmojiFragment from '@pages/home/report/comment/TextWithEmojiFragment';
import type DisplayNamesProps from './types';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames({accessibilityLabel, fullTitle, textStyles = [], numberOfLines = 1, renderAdditionalText, forwardedFSClass, testID, shouldParseHtml = true}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const title = useMemo(() => {
        const processedTitle = shouldParseHtml ? Parser.htmlToText(fullTitle) : fullTitle;
        return StringUtils.lineBreaksToSpaces(processedTitle) || translate('common.hidden');
    }, [fullTitle, shouldParseHtml, translate]);
    const titleContainsTextAndCustomEmoji = useMemo(() => containsCustomEmoji(title) && !containsOnlyCustomEmoji(title), [title]);
    return (
        <Text
            accessibilityLabel={accessibilityLabel}
            style={textStyles}
            numberOfLines={numberOfLines}
            testID={`${DisplayNames.displayName}${testID !== undefined ? `-${testID}` : ''}`}
            fsClass={forwardedFSClass}
        >
            {titleContainsTextAndCustomEmoji ? (
                <TextWithEmojiFragment
                    message={StringUtils.lineBreaksToSpaces(title) || translate('common.hidden')}
                    style={textStyles}
                />
            ) : (
                StringUtils.lineBreaksToSpaces(title) || translate('common.hidden')
            )}
            {renderAdditionalText?.()}
        </Text>
    );
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
