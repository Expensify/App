import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import React from 'react';

type SearchFiltersBarButtonProps = WithSentryLabel & {
    icon: IconAsset;
    text: string;
    onPress: () => void;
    isDisabled?: boolean;
};

function SearchFiltersBarButton({icon, text, onPress, isDisabled = false, sentryLabel}: SearchFiltersBarButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <PressableWithFeedback
            accessibilityLabel={text}
            accessibilityRole="button"
            onPress={onPress}
            style={[styles.searchFiltersBarButton]}
            hoverStyle={isDisabled ? undefined : styles.hoveredComponentBG}
            disabled={isDisabled}
            disabledStyle={styles.buttonOpacityDisabled}
            sentryLabel={sentryLabel}
        >
            <Icon
                src={icon}
                fill={theme.icon}
                size={CONST.ICON_SIZE.EXTRA_SMALL}
            />
            <Text style={[styles.textMicroBoldSupporting]}>{text}</Text>
        </PressableWithFeedback>
    );
}

export default SearchFiltersBarButton;
