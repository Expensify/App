import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchColumnsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const allColumns = Object.values(CONST.SEARCH.COLUMNS);

    const initiallySelectedColumns = searchAdvancedFiltersForm?.columns
        ?.filter((columnId) => Object.values(CONST.SEARCH.COLUMNS).includes(columnId as ValueOf<typeof CONST.SEARCH.COLUMNS>))
        .map((columnId) => {
            const columnName = translate(getSearchColumnTranslationKey(columnId as ValueOf<typeof CONST.SEARCH.COLUMNS>));
            return {name: columnName, value: columnId};
        });

    const columnItems = allColumns.map((columnId) => {
        const columnName = translate(getSearchColumnTranslationKey(columnId));
        return {name: columnName, value: columnId};
    });

    return (
        <ScreenWrapper
            testID={SearchColumnsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.columms')} />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    items={columnItems}
                    initiallySelectedItems={initiallySelectedColumns}
                    onSaveSelection={() => {}}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchColumnsPage.displayName = 'SearchColumnsPage';

export default SearchColumnsPage;
