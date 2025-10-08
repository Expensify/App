import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionListWithSections/SingleSelectListItem';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldListProps = {
    field: PolicyReportField;
    values: Record<string, string | string[] | null>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string | string[] | null>>>;
};

type ListItem = {
    value: string;
    keyForList: string;
    text: string;
    isSelected: boolean;
};

function ReportFieldList({field, values, setValues}: ReportFieldListProps) {
    const styles = useThemeStyles();

    const [selectedItem, setSelectedItem] = useState(() => {
        const value = values[field.fieldID];
        return [value].flat().at(0) ?? null;
    });

    const items = useMemo(() => {
        return field.values.map((value) => ({
            value,
            keyForList: value,
            text: value,
            isSelected: selectedItem === value,
        }));
    }, [field, selectedItem]);

    const updateFilter = useCallback((selectedFilter: ListItem) => {
        const newValue = selectedFilter.isSelected ? null : selectedFilter.value;
        setSelectedItem(newValue);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const saveChanges = useCallback(() => {
        setValues((prevValues) => ({
            ...prevValues,
            [field.fieldID]: selectedItem ?? null,
        }));
    }, [field.fieldID, selectedItem, setValues]);

    return (
        <>
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

ReportFieldList.displayName = 'SearchFiltersReportFieldPage';

export default ReportFieldList;
