import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import Button from '@components/Button';
import ReportFieldBase from '@components/Search/FilterComponents/ReportField';
import type {ReportFieldHandle} from '@components/Search/FilterComponents/ReportField';
import useFullscreenAdvancedFilters from '@components/Search/FilterDropdowns/AdvancedFilters/useFullscreenAdvancedFilters';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldComponentProps = {
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function ReportFieldFilterComponent({values, onChange}: ReportFieldComponentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const fullscreen = useFullscreenAdvancedFilters();
    const [selectedField, setSelectedField] = useState<PolicyReportField | null>(null);
    const reportFieldRef = useRef<ReportFieldHandle>(null);

    let wrapperStyle: ViewStyle | undefined;
    let reportFieldStyle: ViewStyle | undefined;
    if (!fullscreen) {
        reportFieldStyle = styles.pv2;
        wrapperStyle = selectedField ? styles.pt2 : undefined;
    }

    return (
        <View style={[styles.flex1, wrapperStyle]}>
            <ReportFieldBase
                ref={reportFieldRef}
                values={values}
                hasFeed={!!values?.feed}
                selectedField={selectedField}
                onFieldSelected={setSelectedField}
                style={reportFieldStyle}
            />
            {(!!selectedField || fullscreen) && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3, styles.mtAuto]}
                    success
                    medium={!fullscreen}
                    large={fullscreen}
                    text={translate(selectedField ? 'common.apply' : 'common.confirm')}
                    pressOnEnter
                    onPress={() => {
                        if (!reportFieldRef.current) {
                            return;
                        }

                        if (selectedField) {
                            const value = reportFieldRef.current.applySelectedFieldAndGoBack();
                            if (!value) {
                                return;
                            }

                            // In fullscreen, when applying the report field, we don't want to update the filter form values yet.
                            if (fullscreen) {
                                return;
                            }

                            onChange(value);
                            return;
                        }

                        onChange(reportFieldRef.current.getValue());
                    }}
                />
            )}
        </View>
    );
}

export default ReportFieldFilterComponent;
