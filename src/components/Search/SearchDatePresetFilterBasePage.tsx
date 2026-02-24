import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getDatePresets} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import DateFilterBase from './FilterComponents/DateFilterBase';
import type {ReportFieldDateKey, SearchDateFilterKeys} from './types';

type SearchDatePresetFilterBasePageProps = {
    /** Key used for the date filter */
    dateKey: SearchDateFilterKeys;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchDatePresetFilterBasePage({dateKey, titleKey}: SearchDatePresetFilterBasePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const isSearchAdvancedFiltersFormLoading = isLoadingOnyxValue(searchAdvancedFiltersFormMetadata);

    const dateOnKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.ON_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as const);

    const dateBeforeKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as const);

    const dateAfterKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as const);

    const dateOnValue = searchAdvancedFiltersForm?.[dateOnKey];
    const dateBeforeValue = searchAdvancedFiltersForm?.[dateBeforeKey];
    const dateAfterValue = searchAdvancedFiltersForm?.[dateAfterKey];

    function getDefaultDateValues() {
        return {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: dateOnValue,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: dateBeforeValue,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: dateAfterValue,
        };
    }

    function getPresets() {
        const hasFeed = !!searchAdvancedFiltersForm?.feed?.length;
        return getDatePresets(dateKey, hasFeed);
    }

    const goBack = () => {
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

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
                onSubmit={(values) => {
                    updateAdvancedFilters({
                        [dateOnKey]: values[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
                        [dateBeforeKey]: values[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
                        [dateAfterKey]: values[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
                    });
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
        </ScreenWrapper>
    );
}

export default SearchDatePresetFilterBasePage;
