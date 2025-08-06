import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersWithdrawalTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const initiallySelectedItems = useMemo(
        () =>
            searchAdvancedFiltersForm?.withdrawalType
                ?.filter((withdrawalType) => Object.values(CONST.SEARCH.WITHDRAWAL_TYPE).includes(withdrawalType as ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>))
                .map((withdrawalType) => {
                    const withdrawalTypeName = translate(`search.withdrawalType.${withdrawalType}`);
                    return {name: withdrawalTypeName, value: withdrawalType};
                }),
        [searchAdvancedFiltersForm, translate],
    );
    const allWithdrawalTypes = Object.values(CONST.SEARCH.WITHDRAWAL_TYPE);

    const withdrawalTypesItems = useMemo(() => {
        return allWithdrawalTypes.map((withdrawalType) => {
            const withdrawalTypeName = translate(`search.withdrawalType.${withdrawalType}`);
            return {name: withdrawalTypeName, value: withdrawalType};
        });
    }, [allWithdrawalTypes, translate]);

    const updateWithdrawalTypeFilter = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({withdrawalType: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersWithdrawalTypePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.withdrawalType.title')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    items={withdrawalTypesItems}
                    initiallySelectedItems={initiallySelectedItems}
                    onSaveSelection={updateWithdrawalTypeFilter}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersWithdrawalTypePage.displayName = 'SearchFiltersWithdrawalTypePage';

export default SearchFiltersWithdrawalTypePage;