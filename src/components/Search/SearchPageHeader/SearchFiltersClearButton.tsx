import React from 'react';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SearchFiltersClearButtonProps = {
    onPress: () => void;
};

function SearchFiltersClearButton({onPress}: SearchFiltersClearButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);

    return (
        <PressableWithFeedback
            accessibilityLabel={translate('common.clear')}
            onPress={onPress}
            style={[styles.searchFiltersClearButton]}
            hoverStyle={styles.hoveredComponentBG}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.CLEAR_FILTERS_BUTTON}
        >
            <Icon
                src={expensifyIcons.Close}
                fill={theme.icon}
                extraSmall
            />
            <Text style={[styles.textMicroBoldSupporting]}>{translate('common.clear')}</Text>
        </PressableWithFeedback>
    );
}

export default SearchFiltersClearButton;
