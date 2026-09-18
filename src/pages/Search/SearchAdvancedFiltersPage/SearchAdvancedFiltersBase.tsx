import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import {getFilterNegatableValue} from '@libs/SearchUIUtils';

import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useContext} from 'react';

function SearchAdvancedFiltersBase() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {currentDraftFilters, shouldShowResetFilters} = useContext(SearchAdvancedFiltersContext);
    const {applyFilters, resetFilters} = useContext(SearchAdvancedFiltersActionContext);
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles', 'ArrowRight']);

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')} />
            <PressableWithFeedback
                style={({pressed}) => [styles.typeFilterMenu, pressed ? styles.buttonHoveredBG : undefined]}
                accessible
                accessibilityLabel={translate('search.filters.describeSearch.title')}
                role={CONST.ROLE.BUTTON}
                sentryLabel="SearchAdvancedFiltersBase-DescribeSearch"
                onPress={() => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIBE)}
            >
                {({pressed}) => (
                    <>
                        <Icon
                            src={icons.Sparkles}
                            fill={theme.icon}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                        />
                        <Text
                            numberOfLines={2}
                            style={[styles.flex1]}
                        >
                            {translate('search.filters.describeSearch.title')}
                        </Text>
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
            <FilterList
                contentContainerStyle={[styles.pb5]}
                type={currentDraftFilters.type}
                policyID={getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, currentDraftFilters)}
                onPress={(filterKey) => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(filterKey))}
            />
            {shouldShowResetFilters && (
                <Button
                    style={[styles.ph5, styles.pb3]}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={resetFilters}
                >
                    <Button.Text>{translate('common.reset')}</Button.Text>
                </Button>
            )}
            <Button
                style={[styles.ph5, styles.pb5]}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                onPress={applyFilters}
            >
                <Button.Text>{translate('search.applyFilters')}</Button.Text>
            </Button>
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersBase;
