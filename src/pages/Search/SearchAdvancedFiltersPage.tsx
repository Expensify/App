import React from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import AdvancedSearchFilters from './AdvancedSearchFilters';

function SearchAdvancedFiltersPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const emptySearchFilters: SearchAdvancedFiltersForm = {} as SearchAdvancedFiltersForm;
    const [searchAdvancedFilters = emptySearchFilters] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const shouldShowResetFilters = Object.values(searchAdvancedFilters).some((value) => (Array.isArray(value) ? value.length !== 0 : !!value));

    return (
        <ScreenWrapper
            testID={SearchAdvancedFiltersPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')}>
                {shouldShowResetFilters && <TextLink onPress={SearchActions.clearAdvancedFilters}>{translate('search.resetFilters')}</TextLink>}
            </HeaderWithBackButton>
            <AdvancedSearchFilters />
        </ScreenWrapper>
    );
}

SearchAdvancedFiltersPage.displayName = 'SearchAdvancedFiltersPage';

export default SearchAdvancedFiltersPage;
