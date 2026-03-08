import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchGroupBy} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getGroupBySections} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersGroupByPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [selectedItem, setSelectedItem] = useState(searchAdvancedFiltersForm?.groupBy);

    const sections = useMemo(() => {
        return getGroupBySections(translate).map((section, sectionIndex) => ({
            title: section.title,
            sectionIndex,
            customHeader: (
                <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter, sectionIndex > 0 && styles.mt4]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{section.title}</Text>
                </View>
            ),
            data: section.options.map((groupOption) => ({
                text: groupOption.text,
                keyForList: groupOption.value,
                isSelected: selectedItem === groupOption.value,
            })),
        }));
    }, [selectedItem, styles.justifyContentCenter, styles.mt4, styles.optionsListSectionHeader, styles.ph5, styles.textLabelSupporting, translate]);
    const updateSelectedItem = useCallback((type: ListItem<SearchGroupBy>) => {
        setSelectedItem(type?.keyForList ?? undefined);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(undefined);
    }, []);

    const applyChanges = useCallback(() => {
        // When groupBy is cleared, also clear the view since view is only valid when groupBy is set
        const updates = selectedItem ? {groupBy: selectedItem} : {groupBy: null, view: null};
        updateAdvancedFilters(updates);
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
            />
            <View style={[styles.flex1]}>
                <SelectionListWithSections
                    shouldSingleExecuteRowSelect
                    sections={sections}
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
