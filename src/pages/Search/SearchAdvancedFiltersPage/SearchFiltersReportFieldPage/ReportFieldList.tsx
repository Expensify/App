import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionListWithSections/SingleSelectListItem';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldListProps = {
    field: PolicyReportField;
    close: () => void;
};

type ListItem = {
    value: string;
    keyForList: string;
    text: string;
    isSelected: boolean;
};

function ReportFieldList({field, close}: ReportFieldListProps) {
    const formKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${field.name.toLowerCase().replaceAll(' ', '-')}` as const;
    const formSelector = useCallback((form: OnyxEntry<SearchAdvancedFiltersForm>) => form?.[formKey], [formKey]);
    const [value = null] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true, selector: formSelector}, [formKey]);

    const styles = useThemeStyles();
    const [selectedItem, setSelectedItem] = useState(value);

    const items = useMemo(() => {
        return field.values.map((fieldValue) => ({
            value: fieldValue,
            text: fieldValue,
            keyForList: fieldValue,
            isSelected: selectedItem === fieldValue,
        }));
    }, [field.values, selectedItem]);

    const updateFilter = useCallback((selectedFilter: ListItem) => {
        const newValue = selectedFilter.isSelected ? null : selectedFilter.value;
        setSelectedItem(newValue);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const saveChanges = useCallback(() => {
        updateAdvancedFilters({
            [formKey]: selectedItem ?? null,
        });

        close();
    }, [formKey, selectedItem, close]);

    return (
        <>
            <HeaderWithBackButton
                title={field.name}
                onBackButtonPress={close}
                shouldDisplayHelpButton={false}
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
                    applyChanges={saveChanges}
                    resetChanges={resetChanges}
                />
            </FixedFooter>
        </>
    );
}

export default ReportFieldList;
