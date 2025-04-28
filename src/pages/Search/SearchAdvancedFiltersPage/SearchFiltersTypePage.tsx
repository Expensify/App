import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type TypeFilterItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.DATA_TYPES>;
};

function SearchFiltersTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const statusValues = Object.values(CONST.SEARCH.DATA_TYPES);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const selectedItem = useMemo(() => {
        return statusValues.find((value) => searchAdvancedFiltersForm?.[CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE] === value);
    }, [searchAdvancedFiltersForm, statusValues]);

    const items = useMemo(() => {
        return statusValues.map((value) => ({
            value,
            keyForList: value,
            text: translate(`common.${value}`),
            isSelected: selectedItem === value,
        }));
    }, [selectedItem, translate, statusValues]);

    const updateFilter = useCallback((selectedFilter: TypeFilterItem) => {
        updateAdvancedFilters({[CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE]: selectedFilter.value});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, []);

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
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    sections={[{data: items}]}
                    ListItem={RadioListItem}
                    initiallyFocusedOptionKey={selectedItem}
                    onSelectRow={updateFilter}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersTypePage.displayName = 'SearchFiltersTypePage';

export default SearchFiltersTypePage;
