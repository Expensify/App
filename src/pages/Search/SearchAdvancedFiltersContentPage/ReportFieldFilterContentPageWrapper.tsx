import Button from '@components/ButtonComposed';
import ReportFieldFilterContent from '@components/Search/FilterComponents/AdvancedFilters/ReportFieldFilterContent';
import type {ReportFieldFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {PolicyReportField} from '@src/types/onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

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
                size={CONST.BUTTON_SIZE.LARGE}
                onFieldSelected={setSelectedField}
                onChange={(newValues) => setValues((prevValues) => ({...prevValues, ...newValues}))}
            />
            {!selectedField && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3, styles.mtAuto]}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={() => {
                        if (!values) {
                            return;
                        }

                        onChange(values);
                    }}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </Button>
            )}
        </View>
    );
}

export default ReportFieldFilterContentPageWrapper;
