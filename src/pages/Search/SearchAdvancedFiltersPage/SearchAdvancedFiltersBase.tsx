import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

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
    const {isBetaEnabled} = usePermissions();
    const canUseNLFilters = isBetaEnabled(CONST.BETAS.NL_FILTERS);
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles', 'ArrowRight']);

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')} />
            {canUseNLFilters && (
                <>
                    <PressableWithFeedback
                        style={styles.typeFilterMenu}
                        accessible
                        accessibilityLabel={translate('search.filters.describeSearch.title')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel="SearchAdvancedFiltersBase-DescribeSearch"
                        onPress={() => Navigation.navigate(ROUTES.SEARCH_NL_FILTER)}
                    >
                        <Icon
                            src={icons.Sparkles}
                            fill={theme.icon}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                        />
                        <Text style={[styles.flex1]}>{translate('search.filters.describeSearch.title')}</Text>
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </PressableWithFeedback>
                    <SpacerView
                        shouldShow
                        style={[styles.reportHorizontalRule]}
                    />
                </>
            )}
            <FilterList
                contentContainerStyle={[styles.pb5]}
                type={currentDraftFilters.type}
                onPress={(filterKey) => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(filterKey))}
            />
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
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersBase;
