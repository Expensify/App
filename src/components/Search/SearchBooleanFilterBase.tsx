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
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchBooleanFilterKeys} from './types';

type BooleanFilterItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.BOOLEAN>;
};

type SearchBooleanFilterBaseProps = {
    /** Key used for the boolean filter */
    booleanKey: SearchBooleanFilterKeys;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchBooleanFilterBase({booleanKey, titleKey}: SearchBooleanFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const selectedItem = useMemo(() => {
        return booleanValues.find((value) => searchAdvancedFiltersForm?.[booleanKey] === value) ?? null;
    }, [booleanKey, searchAdvancedFiltersForm, booleanValues]);

    const items = useMemo(() => {
        return booleanValues.map((value) => ({
            value,
            keyForList: value,
            text: translate(`common.${value}`),
            isSelected: selectedItem === value,
        }));
    }, [selectedItem, translate, booleanValues]);

    const updateFilter = useCallback(
        (selectedFilter: BooleanFilterItem) => {
            const newValue = selectedFilter.isSelected ? null : selectedFilter.value;

            updateAdvancedFilters({[booleanKey]: newValue});
            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
        },
        [booleanKey],
    );

    return (
        <ScreenWrapper
            testID={SearchBooleanFilterBase.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
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

SearchBooleanFilterBase.displayName = 'SearchBooleanFilterBase';

export default SearchBooleanFilterBase;
