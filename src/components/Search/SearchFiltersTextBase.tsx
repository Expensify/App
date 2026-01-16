import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import TextFilterBase from './FilterComponents/TextFilterBase';
import type {SearchTextFilterKeys} from './types';

// Text-based filter keys that accept string input - these are keys from SearchTextFilterKeys that have string values
type SearchFiltersTextBaseProps = {
    /** The filter key from text-based FILTER_KEYS */
    filterKey: SearchTextFilterKeys;

    /** The translation key for the page title and input label */
    titleKey: TranslationPaths;

    /** Test ID for the screen wrapper */
    testID: string;

    /** The character limit for the input */
    characterLimit?: number;
};

function SearchFiltersTextBase({filterKey, titleKey, testID, characterLimit = CONST.MERCHANT_NAME_MAX_BYTES}: SearchFiltersTextBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const updateFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    return (
        <ScreenWrapper
            testID={testID}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <TextFilterBase
                filterKey={filterKey}
                onSubmit={updateFilter}
                title={translate(titleKey)}
                characterLimit={characterLimit}
            />
        </ScreenWrapper>
    );
}

export default SearchFiltersTextBase;
