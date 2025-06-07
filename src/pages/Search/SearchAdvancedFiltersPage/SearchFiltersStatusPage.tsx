import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const currentType = (searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE).toUpperCase() as keyof typeof CONST.SEARCH.DATA_TYPES;
    const [selectedItems, setSelectedItems] = useState<string[]>(() => {
        if (!searchAdvancedFiltersForm?.status) {
            return [CONST.SEARCH.STATUS.EXPENSE.ALL];
        }

        if (typeof searchAdvancedFiltersForm.status === 'string') {
            return searchAdvancedFiltersForm.status.split(',');
        }

        return searchAdvancedFiltersForm.status;
    });

    const listData: ListItem[] = useMemo(() => {
        return Object.values(CONST.SEARCH.STATUS[currentType]).map((status) => ({
            text: translate(`search.filters.${status}`),
            keyForList: status,
            isSelected: selectedItems.includes(status),
        }));
    }, [currentType, selectedItems, translate]);

    const updateSelectedItems = useCallback(
        (item: ListItem) => {
            if (item.isSelected) {
                setSelectedItems(selectedItems.filter((i) => i !== item.keyForList));
                return;
            }

            if (item.keyForList === CONST.SEARCH.STATUS.EXPENSE.ALL) {
                setSelectedItems([CONST.SEARCH.STATUS.EXPENSE.ALL]);
                return;
            }

            const items = Object.values(CONST.SEARCH.STATUS[currentType]);
            const newItem = items.find((i) => i === item.keyForList);

            if (newItem) {
                setSelectedItems([...selectedItems.filter((i) => i !== CONST.SEARCH.STATUS.EXPENSE.ALL), newItem]);
            }
        },
        [currentType, selectedItems],
    );

    const resetChanges = useCallback(() => {
        setSelectedItems([]);
    }, []);

    const applyChanges = useCallback(() => {
        updateAdvancedFilters({
            status: selectedItems,
        });
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [selectedItems]);

    return (
        <ScreenWrapper
            testID={SearchFiltersStatusPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.status')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View>
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
