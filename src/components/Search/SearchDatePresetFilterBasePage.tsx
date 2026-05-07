import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getDateFilterKeys} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import DateFilterBase from './FilterComponents/DateFilterBase';
import type {SearchDateFilterKeys, SearchFilterKey} from './types';

type SearchDatePresetFilterBasePageProps = {
    /** Key used for the date filter */
    dateKey: Extract<SearchDateFilterKeys, SearchFilterKey>;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchDatePresetFilterBasePage({dateKey, titleKey}: SearchDatePresetFilterBasePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute();
    const params = route.params as {subPage?: string} | undefined;

    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const isSearchAdvancedFiltersFormLoading = isLoadingOnyxValue(searchAdvancedFiltersFormMetadata);

    const {dateOnKey, dateBeforeKey, dateAfterKey, dateRangeKey} = getDateFilterKeys(dateKey) as {
        dateOnKey: SearchAdvancedFiltersKey;
        dateBeforeKey: SearchAdvancedFiltersKey;
        dateAfterKey: SearchAdvancedFiltersKey;
        dateRangeKey: SearchAdvancedFiltersKey;
    };

    // Dynamic key lookup requires narrowing the form to string-valued fields.
    const dateFormValues = searchAdvancedFiltersForm as Record<string, string | undefined> | undefined;
    const dateOnValue = dateFormValues?.[dateOnKey];
    const dateBeforeValue = dateFormValues?.[dateBeforeKey];
    const dateAfterValue = dateFormValues?.[dateAfterKey];
    const dateRangeValue = dateFormValues?.[dateRangeKey];

    function getDefaultDateValues() {
        return {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: dateOnValue,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: dateBeforeValue,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: dateAfterValue,
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: dateRangeValue,
        };
    }

    function getPresets() {
        const hasFeed = !!searchAdvancedFiltersForm?.feed?.length;
        return getDatePresets(dateKey, hasFeed);
    }

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, []);

    const buildSubPageRoute = useCallback((subPage?: string) => ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(dateKey, subPage), [dateKey]);

    let selectedDateModifier: SearchDateModifier | null = null;
    if (params?.subPage === CONST.SEARCH.DATE_FILTER_SUB_PAGE.ON) {
        selectedDateModifier = CONST.SEARCH.DATE_MODIFIERS.ON;
    } else if (params?.subPage === CONST.SEARCH.DATE_FILTER_SUB_PAGE.AFTER) {
        selectedDateModifier = CONST.SEARCH.DATE_MODIFIERS.AFTER;
    } else if (params?.subPage === CONST.SEARCH.DATE_FILTER_SUB_PAGE.BEFORE) {
        selectedDateModifier = CONST.SEARCH.DATE_MODIFIERS.BEFORE;
    } else if (params?.subPage === CONST.SEARCH.DATE_FILTER_SUB_PAGE.RANGE) {
        selectedDateModifier = CONST.SEARCH.DATE_MODIFIERS.RANGE;
    }

    const selectDateModifier = useCallback(
        (dateModifier: SearchDateModifier | null) => {
            if (!dateModifier) {
                Navigation.goBack(buildSubPageRoute());
                return;
            }

            let newSubPage: string;
            if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.ON) {
                newSubPage = CONST.SEARCH.DATE_FILTER_SUB_PAGE.ON;
            } else if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.AFTER) {
                newSubPage = CONST.SEARCH.DATE_FILTER_SUB_PAGE.AFTER;
            } else if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                newSubPage = CONST.SEARCH.DATE_FILTER_SUB_PAGE.RANGE;
            } else {
                newSubPage = CONST.SEARCH.DATE_FILTER_SUB_PAGE.BEFORE;
            }

            // When already on a date modifier subPage, update route params in-place instead of
            // pushing a new screen. This avoids a side-by-side slide animation and preserves
            // ephemeral date state (the calendar value) across modifier switches.
            if (params?.subPage) {
                Navigation.setParams({subPage: newSubPage});
                return;
            }

            Navigation.navigate(buildSubPageRoute(newSubPage));
        },
        [buildSubPageRoute, params?.subPage],
    );

    const defaultDateValues = getDefaultDateValues();
    const presets = getPresets();

    return (
        <ScreenWrapper
            testID="SearchDatePresetFilterBasePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <DateFilterBase
                title={translate(titleKey)}
                defaultDateValues={defaultDateValues}
                presets={presets}
                isSearchAdvancedFiltersFormLoading={isSearchAdvancedFiltersFormLoading}
                onBackButtonPress={goBack}
                selectedDateModifier={selectedDateModifier}
                onSelectDateModifier={selectDateModifier}
                onSubmit={(values) => {
                    updateAdvancedFilters({
                        [dateOnKey]: values[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
                        [dateBeforeKey]: values[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
                        [dateAfterKey]: values[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
                        [dateRangeKey]: values[CONST.SEARCH.DATE_MODIFIERS.RANGE] ?? null,
                    });
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
                onReset={(values) => {
                    updateAdvancedFilters({
                        [dateOnKey]: values[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
                        [dateBeforeKey]: values[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
                        [dateAfterKey]: values[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
                        [dateRangeKey]: values[CONST.SEARCH.DATE_MODIFIERS.RANGE] ?? null,
                    });
                }}
            />
        </ScreenWrapper>
    );
}

export default SearchDatePresetFilterBasePage;
