import Icon from '@components/Icon';
import ListItemCompactAvatar from '@components/SelectionList/ListItemComposed/primitives/ListItemCompactAvatar';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getStyledTextArray from '@libs/GetStyledTextArray';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type Mention from './types';

type MentionSuggestionItemProps = {
    /** The mention to render */
    item: Mention;

    /** Mention prefix that follows the @ sign, highlighted within the rendered text */
    prefix: string;
};

/** A single row of the mention suggester: optional avatar, display name, then the handle. */
function MentionSuggestionItem({item, prefix}: MentionSuggestionItemProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const styledDisplayName = getStyledTextArray(item.text, prefix);
    const styledHandle = item.text === item.alternateText ? undefined : getStyledTextArray(item.alternateText, prefix);
    const icon = item.icons?.at(0);
    // The "@here" row renders a plain icon rather than an avatar, so it is smaller and takes the success fill.
    const isIcon = item.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT;

    return (
        <View style={[styles.autoCompleteSuggestionContainer, styles.ph2]}>
            {!!icon &&
                (isIcon ? (
                    <View style={styles.compactAvatarContainer}>
                        <Icon
                            src={typeof icon.source === 'string' ? undefined : icon.source}
                            width={StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.XXX_SMALL)}
                            height={StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.XXX_SMALL)}
                            fill={theme.success}
                            additionalStyles={StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.XXX_SMALL, CONST.AVATAR_SHAPE.CIRCLE)}
                        />
                    </View>
                ) : (
                    <ListItemCompactAvatar icon={icon} />
                ))}
            <Text
                style={[styles.mentionSuggestionsText, styles.flexShrink1]}
                numberOfLines={1}
            >
                {styledDisplayName?.map(({text, isColored}, i) => (
                    <Text
                        // The styled text segments are positional and stable for a given name+prefix, so the index is a safe key
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${text}${i}`}
                        style={[StyleUtils.getColoredBackgroundStyle(isColored), styles.mentionSuggestionsDisplayName]}
                    >
                        {text}
                    </Text>
                ))}
            </Text>
            <Text
                style={[styles.mentionSuggestionsText, styles.flex1]}
                numberOfLines={1}
            >
                {styledHandle?.map(
                    ({text, isColored}, i) =>
                        !!text && (
                            <Text
                                // eslint-disable-next-line react/no-array-index-key
                                key={`${text}${i}`}
                                style={[StyleUtils.getColoredBackgroundStyle(isColored), styles.textSupporting]}
                            >
                                {text}
                            </Text>
                        ),
                )}
            </Text>
        </View>
    );
}

export default MentionSuggestionItem;
