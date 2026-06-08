import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {SearchWithdrawalStatus} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getWithdrawalStatusOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function SearchFiltersWithdrawalStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormResult] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const items = useMemo(() => getWithdrawalStatusOptions(translate).map((option) => ({name: option.text, value: option.value})), [translate]);

    const initiallySelectedItems = useMemo(() => {
        const formValue = searchAdvancedFiltersForm?.withdrawalStatus;
        if (!formValue?.length) {
            return undefined;
        }
        return items.filter((item) => formValue.includes(item.value));
    }, [items, searchAdvancedFiltersForm?.withdrawalStatus]);

    const updateWithdrawalStatusFilter = useCallback((values: SearchWithdrawalStatus) => updateAdvancedFilters({withdrawalStatus: values.length ? values : null}), []);

    return (
        <ScreenWrapper
            testID="SearchFiltersWithdrawalStatusPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.withdrawalStatus')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                {!isLoadingOnyxValue(searchAdvancedFiltersFormResult) && (
                    <SearchMultipleSelectionPicker
                        items={items}
                        initiallySelectedItems={initiallySelectedItems}
                        onSaveSelection={updateWithdrawalStatusFilter}
                        shouldShowTextInput={false}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

export default SearchFiltersWithdrawalStatusPage;
