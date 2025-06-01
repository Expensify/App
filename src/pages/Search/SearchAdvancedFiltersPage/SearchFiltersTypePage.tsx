import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedItem, setSelectedItem] = useState<string>(searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE);

    const listData: ListItem[] = useMemo(() => {
        return [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.TASK].map((type) => ({
            text: translate(`common.${type}`),
            keyForList: type,
            isSelected: selectedItem === type,
        }));
    }, [selectedItem, translate]);

    const updateSelectedItem = useCallback((type: ListItem) => {
        setSelectedItem(type?.keyForList ?? CONST.SEARCH.DATA_TYPES.EXPENSE);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(CONST.SEARCH.DATA_TYPES.EXPENSE);
    }, []);

    const applyChanges = useCallback(() => {
        updateAdvancedFilters({
            type: selectedItem,
        });
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [selectedItem]);

    return (
        <ScreenWrapper
            testID={SearchFiltersTypePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.type')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    sections={[{data: listData}]}
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

SearchFiltersTypePage.displayName = 'SearchFiltersTypePage';

export default SearchFiltersTypePage;
