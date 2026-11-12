/** Lets empty search results share the filter bar's applied-query reset action. */
import Button from '@components/Button';
import useSearchFiltersReset from '@components/Search/SearchPageHeader/useSearchFiltersReset';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

function SearchResetFiltersButton() {
    const {canReset, resetFilters} = useSearchFiltersReset();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    if (!canReset) {
        return null;
    }

    return (
        <View style={[styles.mt6, styles.flexRow, styles.justifyContentCenter]}>
            <Button
                onPress={resetFilters}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.EMPTY_STATE.RESET_FILTERS}
            >
                <Button.Text>{translate('search.resetFilters')}</Button.Text>
            </Button>
        </View>
    );
}

export default SearchResetFiltersButton;
