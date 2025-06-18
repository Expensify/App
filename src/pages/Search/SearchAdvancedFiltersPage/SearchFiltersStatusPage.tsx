import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
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
    const currentGroupBy = searchAdvancedFiltersForm?.groupBy;
    const [selectedItems, setSelectedItems] = useState<string[]>(() => {
        if (!searchAdvancedFiltersForm?.status || searchAdvancedFiltersForm.status === CONST.SEARCH.STATUS.EXPENSE.ALL) {
            return [];
        }

        if (typeof searchAdvancedFiltersForm.status === 'string') {
            return searchAdvancedFiltersForm.status.split(',');
        }

        return searchAdvancedFiltersForm.status;
    });

    const items = useMemo(() => getStatusOptions(currentType, currentGroupBy), [currentGroupBy, currentType]);

    const listData: ListItem[] = useMemo(() => {
        return items.map((statusOption) => ({
            text: translate(statusOption.translation),
            keyForList: statusOption.value,
            isSelected: selectedItems.includes(statusOption.value),
        }));
    }, [items, selectedItems, translate]);

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
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [selectedItems]);

    if (searchAdvancedFiltersFormResult.status === 'loading') {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID={SearchFiltersStatusPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.status')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    sections={[{data: listData}]}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <Button
                    large
                    style={[styles.mt4]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    large
                    success
                    pressOnEnter
                    style={[styles.mt4]}
                    text={translate('common.save')}
                    onPress={applyChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

SearchFiltersStatusPage.displayName = 'SearchFiltersStatusPage';

export default SearchFiltersStatusPage;
