import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAdvancedFilters} from '@libs/actions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import AdvancedSearchFilters from './AdvancedSearchFilters';

function SearchAdvancedFiltersPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFilters = getEmptyObject<SearchAdvancedFiltersForm>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const shouldShowResetFilters = Object.entries(searchAdvancedFilters)
        .filter(([key, value]) => {
            if (key === CONST.SEARCH.SYNTAX_ROOT_KEYS.COLUMNS) {
                return false;
            }

            if (key === CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE) {
                return value !== CONST.SEARCH.DATA_TYPES.EXPENSE;
            }

            if (key === CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS) {
                return value !== CONST.SEARCH.STATUS.EXPENSE.ALL;
            }

            return true;
        })
        .some(([, value]) => (Array.isArray(value) ? value.length !== 0 : !!value));

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')}>
                {shouldShowResetFilters && <TextLink onPress={clearAdvancedFilters}>{translate('search.resetFilters')}</TextLink>}
            </HeaderWithBackButton>
            <AdvancedSearchFilters />
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersPage;
