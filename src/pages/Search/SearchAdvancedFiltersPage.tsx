import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import TextLink from '@components/TextLink';
import * as SearchActions from '@userActions/Search';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import { isEmptyObject } from '@src/types/utils/EmptyObject';

function SearchAdvancedFiltersPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFilters = {} as SearchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const shouldShowResetFilters = Object.values(searchAdvancedFilters).some(value => Array.isArray(value) ? value.length !== 0 : value !== '');

    return (
        <ScreenWrapper
            testID={SearchAdvancedFiltersPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')}>
                {shouldShowResetFilters && 
                    <TextLink onPress={SearchActions.clearAdvancedFilters}>
                        {translate('search.resetFilters')}
                    </TextLink>
                }
            </HeaderWithBackButton>
            <AdvancedSearchFilters />
        </ScreenWrapper>
    );
}

SearchAdvancedFiltersPage.displayName = 'SearchAdvancedFiltersPage';

export default SearchAdvancedFiltersPage;
