import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ReportFieldFilterContent from '@components/Search/FilterComponents/AdvancedFilters/ReportFieldFilterContent';
import type {ReportFieldFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PolicyReportField} from '@src/types/onyx';

function ReportFieldFilterContentPageWrapper({values: initialValues, onChange}: ReportFieldFilterContentWrapperProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [selectedField, setSelectedField] = useState<PolicyReportField | null>(null);
    const [values, setValues] = useState(initialValues);

    return (
        <View style={[styles.flex1]}>
            <ReportFieldFilterContent
                values={values}
                selectedField={selectedField}
                largeButton
                onFieldSelected={setSelectedField}
                onChange={(newValues) => setValues((prevValues) => ({...prevValues, ...newValues}))}
            />
            {!selectedField && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3, styles.mtAuto]}
                    success
                    large
                    text={translate('common.confirm')}
                    pressOnEnter
                    onPress={() => {
                        if (!values) {
                            return;
                        }

                        onChange(values);
                    }}
                />
            )}
        </View>
    );
}

export default ReportFieldFilterContentPageWrapper;
