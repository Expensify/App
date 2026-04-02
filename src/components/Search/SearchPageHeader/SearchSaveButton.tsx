import React from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SearchSaveButton() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark']);

    const openSaveSearchPage = () => {
        Navigation.navigate(ROUTES.SEARCH_SAVE);
    };

    if (shouldUseNarrowLayout) {
        return (
            <PressableWithoutFeedback
                accessibilityLabel={translate('common.save')}
                role={CONST.ROLE.BUTTON}
                style={[styles.touchableButtonImage]}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SAVE_BUTTON}
                onPress={openSaveSearchPage}
            >
                <Icon
                    src={expensifyIcons.Bookmark}
                    fill={theme.icon}
                    small
                />
            </PressableWithoutFeedback>
        );
    }

    return (
        <Button
            small
            icon={expensifyIcons.Bookmark}
            text={translate('common.save')}
            onPress={openSaveSearchPage}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SAVE_BUTTON}
        />
    );
}

export default SearchSaveButton;
