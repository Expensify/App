import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
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
import {getWithdrawalStatusOptions} from '@libs/SearchUIUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type WithdrawalStatusValue = ValueOf<typeof CONST.SEARCH.SETTLEMENT_STATUS>;

function SearchFiltersWithdrawalStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormResult] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [selectedItems, setSelectedItems] = useState<WithdrawalStatusValue[]>(() => {
        const formValue = searchAdvancedFiltersForm?.withdrawalStatus;
        if (!formValue) {
            return [];
        }
        return Array.isArray(formValue) ? formValue : [formValue];
    });

    const items = useMemo(() => getWithdrawalStatusOptions(translate), [translate]);

    const listData: ListItem[] = useMemo(() => {
        return items.map((option) => ({
            text: option.text,
            keyForList: option.value,
            isSelected: selectedItems.includes(option.value),
        }));
    }, [items, selectedItems]);

    const updateSelectedItems = useCallback(
        (listItem: ListItem) => {
            if (listItem.isSelected) {
                setSelectedItems(selectedItems.filter((item) => item !== listItem.keyForList));
                return;
            }

            const newItem = items.find((option) => option.value === listItem.keyForList)?.value;

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
        updateAdvancedFilters({
            withdrawalStatus: selectedItems.length ? selectedItems : null,
        });
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [selectedItems]);

    if (searchAdvancedFiltersFormResult.status === 'loading') {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'SearchFiltersWithdrawalStatusPage',
            isLoading: searchAdvancedFiltersFormResult.status === 'loading',
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <ScreenWrapper
            testID="SearchFiltersWithdrawalStatusPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.withdrawalStatus')}
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

export default SearchFiltersWithdrawalStatusPage;
