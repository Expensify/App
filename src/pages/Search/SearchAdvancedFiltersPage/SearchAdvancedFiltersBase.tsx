import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';

import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useDebouncedState from '@hooks/useDebouncedState';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import {getMatchingFilters, isLabelMatchingSearchValue} from '@libs/SearchUIUtils';

import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useContext} from 'react';
import {View} from 'react-native';

function SearchAdvancedFiltersBase() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {currentDraftFilters, shouldShowResetFilters} = useContext(SearchAdvancedFiltersContext);
    const {applyFilters, resetFilters} = useContext(SearchAdvancedFiltersActionContext);
    const isInLandscapeMode = useIsInLandscapeMode();
    const shouldFooterBeInsideList = useShouldFooterBeInsideList();
    const StyleUtils = useStyleUtils();
    const {isBetaEnabled} = usePermissions();
    const canUseNLFilters = isBetaEnabled(CONST.BETAS.NL_FILTERS);
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles', 'ArrowRight']);
    const [filterSearchValue, debouncedFilterSearchValue, setFilterSearchValue] = useDebouncedState('', CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
    const allFilters = useAdvancedSearchFilters(currentDraftFilters.type);
    // A cleared input lists every filter at once rather than after the debounce, as in useSearchResults.
    const listedSearchValue = filterSearchValue.trim() ? debouncedFilterSearchValue : '';
    const filters = getMatchingFilters(allFilters, currentDraftFilters.type, listedSearchValue, translate);
    const isDescribeSearchListed = canUseNLFilters && isLabelMatchingSearchValue(translate('search.filters.describeSearch.title'), listedSearchValue);

    const footer = (
        <View style={[isInLandscapeMode ? [styles.flexRow, styles.gap2] : [styles.gap3], styles.ph5, styles.pb5]}>
            {shouldShowResetFilters && (
                <Button
                    style={[isInLandscapeMode ? styles.flex1 : undefined]}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={resetFilters}
                >
                    <Button.Text>{translate('common.reset')}</Button.Text>
                </Button>
            )}
            <Button
                style={[isInLandscapeMode ? styles.flex1 : undefined]}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                onPress={applyFilters}
            >
                <Button.Text>{translate('search.applyFilters')}</Button.Text>
            </Button>
        </View>
    );

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')} />
            <FilterList
                contentContainerStyle={[styles.pb5]}
                type={currentDraftFilters.type}
                filters={filters}
                searchValue={filterSearchValue}
                onSearchValueChange={setFilterSearchValue}
                headerContent={
                    isDescribeSearchListed && (
                        <>
                            <PressableWithFeedback
                                style={({pressed}) => [styles.typeFilterMenu, pressed && styles.buttonHoveredBG]}
                                accessible
                                accessibilityLabel={translate('search.filters.describeSearch.title')}
                                sentryLabel="SearchAdvancedFiltersBase-DescribeSearch"
                                onPress={() => Navigation.navigate(ROUTES.SEARCH_NL_FILTER)}
                            >
                                {({pressed}) => (
                                    <>
                                        <Icon
                                            src={icons.Sparkles}
                                            fill={theme.icon}
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                        />
                                        <Text style={[styles.flex1]}>{translate('search.filters.describeSearch.title')}</Text>
                                        <Icon
                                            src={icons.ArrowRight}
                                            fill={StyleUtils.getIconFillColor({buttonState: getButtonState({isPressed: pressed})})}
                                            width={variables.iconSizeNormal}
                                            height={variables.iconSizeNormal}
                                        />
                                    </>
                                )}
                            </PressableWithFeedback>
                            <SpacerView
                                shouldShow
                                style={[styles.reportHorizontalRule]}
                            />
                        </>
                    )
                }
                onPress={(filterKey) => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(filterKey))}
                footerContent={shouldFooterBeInsideList && footer}
            />
            {!shouldFooterBeInsideList && footer}
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersBase;
