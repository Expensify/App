import React from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {ButtonComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SearchAdvancedFiltersPopup from '@components/Search/FilterDropdowns/SearchAdvancedFiltersPopup';
import type {SearchQueryJSON} from '@components/Search/types';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchFilterSync from '@hooks/useSearchFilterSync';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- advanced filters page is only rendered on the small screen
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter']);
    const filterFormValues = useFilterFormValues(queryJSON);
    useSearchFilterSync(queryJSON, filterFormValues);

    if (isSmallScreenWidth) {
        return (
            <PressableWithFeedback
                accessibilityLabel={translate('search.filtersHeader')}
                role={CONST.ROLE.BUTTON}
                style={[styles.searchActionsBar(true)]}
                hoverStyle={styles.buttonHoveredBG}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
                onPress={() => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS)}
            >
                <Icon
                    src={expensifyIcons.Filter}
                    fill={theme.icon}
                    small
                />
            </PressableWithFeedback>
        );
    }

    const filterButton = isMediumScreenWidth
        ? ({onPress, ref}: ButtonComponentProps) => (
              <PressableWithFeedback
                  ref={ref}
                  accessibilityLabel={translate('search.filtersHeader')}
                  role={CONST.ROLE.BUTTON}
                  style={[styles.searchActionsBar(false)]}
                  hoverStyle={styles.buttonHoveredBG}
                  sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
                  onPress={onPress}
              >
                  <Icon
                      src={expensifyIcons.Filter}
                      fill={theme.icon}
                      extraSmall
                  />
              </PressableWithFeedback>
          )
        : ({onPress, ref, isExpanded}: ButtonComponentProps) => (
              <Button
                  ref={ref}
                  small
                  accessibilityLabel={translate('search.filtersHeader')}
                  text={translate('search.filtersHeader')}
                  icon={expensifyIcons.Filter}
                  onPress={onPress}
                  innerStyles={isExpanded ? styles.buttonDefaultHovered : undefined}
                  sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
              />
          );

    const filtersPopup = () => <SearchAdvancedFiltersPopup queryJSON={queryJSON} />;

    return (
        <FilterPopupButton
            PopoverComponent={filtersPopup}
            popoverWidth={CONST.ADVANCED_FILTERS_POPOVER_WIDTH}
            popoverAnchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            renderButton={filterButton}
        />
    );
}

export default SearchAdvancedFiltersButton;
