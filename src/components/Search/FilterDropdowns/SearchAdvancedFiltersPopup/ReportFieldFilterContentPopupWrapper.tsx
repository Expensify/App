import React, {useState} from 'react';
import {View} from 'react-native';
import ReportFieldFilterContent from '@components/Search/FilterComponents/AdvancedFilters/ReportFieldFilterContent';
import type {ReportFieldFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PolicyReportField} from '@src/types/onyx';

function ReportFieldFilterContentPopupWrapper({values, onChange}: ReportFieldFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const [selectedField, setSelectedField] = useState<PolicyReportField | null>(null);

    return (
        <View style={[styles.flex1, selectedField ? styles.pt2 : undefined]}>
            <ReportFieldFilterContent
                values={values}
                selectedField={selectedField}
                style={[styles.pv2]}
                onFieldSelected={setSelectedField}
                onChange={onChange}
            />
        </View>
    );
}

export default ReportFieldFilterContentPopupWrapper;
