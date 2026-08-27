import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getStyledTextArray from '@libs/GetStyledTextArray';
import {getAccountIDFromAvatarID} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import React, {useCallback} from 'react';
import {View} from 'react-native';

import type {MeasureParentContainerAndCursorCallback} from './AutoCompleteSuggestions/types';

import AutoCompleteSuggestions from './AutoCompleteSuggestions';
import UserAvatar from './Avatar/UserAvatar';
import Icon from './Icon';
import Text from './Text';

type Mention = {
    /**
     * Main display text of the mention
     * always visible right after icon (if present)
     */
    text: string;

    /**
     * Additional text for the mention
     * visible if it's value is different than Mention.text value
     * rendered after Mention.text
     */
    alternateText: string;

    /**
     * Handle of the mention
     * used as a value for the mention (e.g. in for the filtering or putting the mention in the message)
     */
    handle?: string;

    /** Array of icons of the mention. If present, we use the first element of this array. For room suggestions, the icons are not used */
    icons?: IconType[];
};

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
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    /**
     * Render a suggestion menu item component.
     */
    const renderSuggestionMenuItem = useCallback(
        (item: Mention) => {
            // The @here suggestion carries a static SVG (Megaphone), not a user's avatar.
            const isIcon = item.text === CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT;
            const firstIcon = item.icons?.at(0);
            const styledDisplayName = getStyledTextArray(item.text, prefix);
            const styledHandle = item.text === item.alternateText ? undefined : getStyledTextArray(item.alternateText, prefix);

            return (
                <View style={[styles.autoCompleteSuggestionContainer, styles.ph2]}>
                    {!!firstIcon && (
                        <View style={styles.mentionSuggestionsAvatarContainer}>
                            {isIcon ? (
                                <Icon
                                    src={typeof firstIcon.source === 'string' ? undefined : firstIcon.source}
                                    width={StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.XXX_SMALL)}
                                    height={StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.XXX_SMALL)}
                                    fill={theme.success}
                                    additionalStyles={StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.XXX_SMALL, CONST.ICON_TYPE_AVATAR)}
                                />
                            ) : (
                                <UserAvatar
                                    source={firstIcon.source}
                                    size={CONST.AVATAR_SIZE.X_SMALL}
                                    accountID={getAccountIDFromAvatarID(firstIcon.id)}
                                    fallbackIcon={firstIcon.fallbackIcon}
                                />
                            )}
                        </View>
                    )}
                    <Text
                        style={[styles.mentionSuggestionsText, styles.flexShrink1]}
                        numberOfLines={1}
                    >
                        {styledDisplayName?.map(({text, isColored}, i) => (
                            <Text
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
        },
        [
            prefix,
            styles.autoCompleteSuggestionContainer,
            styles.ph2,
            styles.mentionSuggestionsAvatarContainer,
            styles.mentionSuggestionsText,
            styles.flexShrink1,
            styles.flex1,
            styles.mentionSuggestionsDisplayName,
            styles.textSupporting,
            theme.success,
            StyleUtils,
        ],
    );

    return (
        <AutoCompleteSuggestions
            suggestions={mentions}
            renderSuggestionMenuItem={renderSuggestionMenuItem}
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

export type {Mention};
