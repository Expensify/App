import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getStatusOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormResult] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const currentType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
    const [selectedItems, setSelectedItems] = useState<string[]>(() => {
        if (!searchAdvancedFiltersForm?.status || searchAdvancedFiltersForm.status === CONST.SEARCH.STATUS.EXPENSE.ALL) {
            return [];
        }

        if (typeof searchAdvancedFiltersForm.status === 'string') {
            return searchAdvancedFiltersForm.status.split(',');
        }

        return searchAdvancedFiltersForm.status;
    });

    const items = useMemo(() => getStatusOptions(translate, currentType), [translate, currentType]);

    const listData: ListItem[] = useMemo(() => {
        return items.map((statusOption) => ({
            text: statusOption.text,
            keyForList: statusOption.value,
            isSelected: selectedItems.includes(statusOption.value),
        }));
    }, [items, selectedItems]);

    const updateSelectedItems = useCallback(
        (listItem: ListItem) => {
            if (listItem.isSelected) {
                setSelectedItems(selectedItems.filter((i) => i !== listItem.keyForList));
                return;
            }

            const newItem = items.find((i) => i.value === listItem.keyForList)?.value;

            if (newItem) {
                setSelectedItems([...selectedItems, newItem]);
            }
        },
        [items, selectedItems],
    );

    const resetChanges = useCallback(() => {
        setSelectedItems([]);
    }, []);

    const applyChanges = useCallback(() => {
        const newStatus = selectedItems.length ? selectedItems : CONST.SEARCH.STATUS.EXPENSE.ALL;
        updateAdvancedFilters({
            status: newStatus,
        });
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [selectedItems]);

    if (searchAdvancedFiltersFormResult.status === 'loading') {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID="SearchFiltersStatusPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.status')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={listData}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
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

export default SearchFiltersStatusPage;
