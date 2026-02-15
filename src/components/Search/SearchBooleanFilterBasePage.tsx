import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';
import type {SearchBooleanFilterKeys} from './types';

type BooleanFilterItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.BOOLEAN>;
};

type SearchBooleanFilterBasePageProps = {
    /** Key used for the boolean filter */
    booleanKey: SearchBooleanFilterKeys;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchBooleanFilterBasePage({booleanKey, titleKey}: SearchBooleanFilterBasePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const [selectedItem, setSelectedItem] = useState(() => {
        return booleanValues.find((value) => searchAdvancedFiltersForm?.[booleanKey] === value) ?? null;
    });

    const items = useMemo(() => {
        return booleanValues.map((value) => ({
            value,
            keyForList: value,
            text: translate(`common.${value}`),
            isSelected: selectedItem === value,
        }));
    }, [selectedItem, translate, booleanValues]);

    const updateFilter = useCallback((selectedFilter: BooleanFilterItem) => {
        const newValue = selectedFilter.isSelected ? null : selectedFilter.value;
        setSelectedItem(newValue);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const applyChanges = useCallback(() => {
        updateAdvancedFilters({[booleanKey]: selectedItem});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [booleanKey, selectedItem]);

    return (
        <ScreenWrapper
            testID="SearchBooleanFilterBasePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={items}
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateFilter}
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons
                    applyChanges={applyChanges}
                    resetChanges={resetChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default SearchBooleanFilterBasePage;
