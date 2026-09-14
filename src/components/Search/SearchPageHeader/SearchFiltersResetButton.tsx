import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type SearchFiltersResetButtonProps = {
    onPress: () => void;
};

function SearchFiltersResetButton({onPress}: SearchFiltersResetButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['RotateLeft']);

    return (
        <PressableWithFeedback
            accessibilityLabel={translate('common.reset')}
            onPress={onPress}
            style={[styles.searchFiltersResetButton]}
            hoverStyle={styles.hoveredComponentBG}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.RESET_FILTERS_BUTTON}
        >
            <Icon
                src={expensifyIcons.RotateLeft}
                fill={theme.icon}
                size={CONST.ICON_SIZE.EXTRA_SMALL}
            />
            <Text style={[styles.textMicroBoldSupporting]}>{translate('common.reset')}</Text>
        </PressableWithFeedback>
    );
}

export default SearchFiltersResetButton;
