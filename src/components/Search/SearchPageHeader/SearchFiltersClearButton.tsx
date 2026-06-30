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

    /** On a suggested search the action resets to its defaults rather than clearing all filters */
    isReset?: boolean;
};

function SearchFiltersClearButton({onPress, isReset = false}: SearchFiltersClearButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close', 'RotateLeft']);
    const label = translate(isReset ? 'common.reset' : 'common.clear');

    return (
        <PressableWithFeedback
            accessibilityLabel={label}
            onPress={onPress}
            style={[styles.searchFiltersClearButton]}
            hoverStyle={styles.hoveredComponentBG}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.CLEAR_FILTERS_BUTTON}
        >
            <Icon
                src={isReset ? expensifyIcons.RotateLeft : expensifyIcons.Close}
                fill={theme.icon}
                extraSmall
            />
            <Text style={[styles.textMicroBoldSupporting]}>{label}</Text>
        </PressableWithFeedback>
    );
}

export default SearchFiltersClearButton;
