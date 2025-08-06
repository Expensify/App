import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersWithdrawalTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const getWithdrawalTypeTranslationKey = useCallback((withdrawalType: ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>) => {
        switch (withdrawalType) {
            case CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT:
                return 'search.withdrawalType.reimbursement' as const;
            case CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD:
                return 'search.withdrawalType.expensifyCard' as const;
            default:
                return 'search.withdrawalType.reimbursement' as const;
        }
    }, []);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedItem, setSelectedItem] = useState(() => {
        const currentValue = searchAdvancedFiltersForm?.withdrawalType;
        return Object.values(CONST.SEARCH.WITHDRAWAL_TYPE).includes(currentValue as ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>) 
            ? currentValue 
            : null;
    });

    const listData: Array<ListItem<ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>>> = useMemo(() => {
        return Object.values(CONST.SEARCH.WITHDRAWAL_TYPE).map((withdrawalType) => ({
            text: translate(getWithdrawalTypeTranslationKey(withdrawalType)),
            keyForList: withdrawalType,
            isSelected: selectedItem === withdrawalType,
        }));
    }, [selectedItem, translate, getWithdrawalTypeTranslationKey]);

    const updateSelectedItem = useCallback((item: ListItem<ValueOf<typeof CONST.SEARCH.WITHDRAWAL_TYPE>>) => {
        setSelectedItem(item?.keyForList ?? null);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const applyChanges = useCallback(() => {
        updateAdvancedFilters({withdrawalType: selectedItem ?? ''});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [selectedItem]);

    return (
        <ScreenWrapper
            testID={SearchFiltersWithdrawalTypePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.withdrawalType.title')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    sections={[{data: listData}]}
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons
                    resetChanges={resetChanges}
                    applyChanges={applyChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

SearchFiltersWithdrawalTypePage.displayName = 'SearchFiltersWithdrawalTypePage';

export default SearchFiltersWithdrawalTypePage;