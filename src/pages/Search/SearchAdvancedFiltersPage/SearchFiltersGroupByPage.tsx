import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchGroupBy} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getGroupByOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersGroupByPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedItem, setSelectedItem] = useState(searchAdvancedFiltersForm?.groupBy);

    const listData: Array<ListItem<SearchGroupBy>> = useMemo(() => {
        return getGroupByOptions(translate).map((groupOption) => ({
            text: groupOption.text,
            keyForList: groupOption.value,
            isSelected: selectedItem === groupOption.value,
        }));
    }, [translate, selectedItem]);

    const updateSelectedItem = useCallback((type: ListItem<SearchGroupBy>) => {
        setSelectedItem(type?.keyForList ?? undefined);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(undefined);
    }, []);

    const applyChanges = useCallback(() => {
        updateAdvancedFilters({groupBy: selectedItem ?? null});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [selectedItem]);

    return (
        <ScreenWrapper
            testID="SearchFiltersGroupByPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.groupBy')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
                shouldDisplayHelpButton={false}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={listData}
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
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

export default SearchFiltersGroupByPage;
