import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersBillablePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const initiallySelectedItems = useMemo(() => {
        return searchAdvancedFiltersForm?.billable
            ?.filter((billable) => Object.values(CONST.SEARCH.BILLABLE).includes(billable as ValueOf<typeof CONST.SEARCH.BILLABLE>))
            .map((billable) => {
                const billableValueName = translate(`common.${billable as ValueOf<typeof CONST.SEARCH.BILLABLE>}`);
                return {name: billableValueName, value: billable};
            });
    }, [searchAdvancedFiltersForm, translate]);

    const allBillableTypes = Object.values(CONST.SEARCH.BILLABLE);

    const billableItems = useMemo(() => {
        return allBillableTypes.map((billable) => {
            const billableValueName = translate(`common.${billable}`);
            return {name: billableValueName, value: billable};
        });
    }, [allBillableTypes, translate]);

    const updateBillableTypeFilter = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({billable: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersBillablePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.billable')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    disableSort
                    items={billableItems}
                    initiallySelectedItems={initiallySelectedItems}
                    onSaveSelection={updateBillableTypeFilter}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersBillablePage.displayName = 'SearchFiltersBillablePage';

export default SearchFiltersBillablePage;
