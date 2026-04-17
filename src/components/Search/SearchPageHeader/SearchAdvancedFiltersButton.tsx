import React from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchQueryJSON} from '@components/Search/types';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchFilterSync from '@hooks/useSearchFilterSync';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type SearchAdvancedFiltersButtonProp = {
    queryJSON: SearchQueryJSON;
};

function SearchAdvancedFiltersButton({queryJSON}: SearchAdvancedFiltersButtonProp) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter']);
    const filterFormValues = useFilterFormValues(queryJSON);
    useSearchFilterSync(filterFormValues);

    const openAdvancedFilters = () => {
        updateAdvancedFilters(filterFormValues);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    if (shouldUseNarrowLayout || isMediumScreenWidth) {
        return (
            <PressableWithFeedback
                accessibilityLabel={translate('search.filtersHeader')}
                role={CONST.ROLE.BUTTON}
                style={[styles.searchActionsBar(shouldUseNarrowLayout)]}
                hoverStyle={styles.buttonHoveredBG}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
                onPress={openAdvancedFilters}
            >
                <Icon
                    src={expensifyIcons.Filter}
                    fill={theme.icon}
                    small={shouldUseNarrowLayout}
                    extraSmall={isMediumScreenWidth}
                />
            </PressableWithFeedback>
        );
    }

    return (
        <Button
            small
            accessibilityLabel={translate('search.filtersHeader')}
            text={translate('search.filtersHeader')}
            icon={expensifyIcons.Filter}
            onPress={openAdvancedFilters}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
        />
    );
}

export default SearchAdvancedFiltersButton;
