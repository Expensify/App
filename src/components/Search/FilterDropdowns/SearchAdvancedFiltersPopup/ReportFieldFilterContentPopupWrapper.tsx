import ReportFieldFilterContent from '@components/Search/FilterComponents/AdvancedFilters/ReportFieldFilterContent';
import type {ReportFieldFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {PolicyReportField} from '@src/types/onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

function ReportFieldFilterContentPopupWrapper({values, onChange}: ReportFieldFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const [selectedField, setSelectedField] = useState<PolicyReportField | null>(null);

    return (
        <View style={[styles.flex1, selectedField ? styles.pt2 : undefined]}>
            <ReportFieldFilterContent
                values={values}
                selectedField={selectedField}
                style={[styles.pv2]}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY.REPORT_FIELD}
                onFieldSelected={setSelectedField}
                onChange={onChange}
            />
        </View>
    );
}

export default ReportFieldFilterContentPopupWrapper;
