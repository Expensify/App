import React from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionListWithSections/SingleSelectListItem';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldListProps = {
    field: PolicyReportField;
    values: Record<string, string | string[]>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string | string[]>>>;
};

function ReportFieldList({field, values, setValues}: ReportFieldListProps) {
    const styles = useThemeStyles();

    return (
        <>
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={[]}
                    ListItem={SingleSelectListItem}
                    onSelectRow={() => {}}
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons
                    applyChanges={() => {}}
                    resetChanges={() => {}}
                />
            </FixedFooter>
        </>
    );
}

ReportFieldList.displayName = 'SearchFiltersReportFieldPage';

export default ReportFieldList;
