import Button from '@components/Button';
import ReportFieldBase from '@components/Search/FilterComponents/ReportField';
import type {ReportFieldHandle} from '@components/Search/FilterComponents/ReportField';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {PolicyReportField} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useRef} from 'react';

type ReportFieldFilterContentProps = {
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    selectedField: PolicyReportField | null;
    largeButton?: boolean;
    style?: StyleProp<ViewStyle>;
    onFieldSelected: (field: PolicyReportField | null) => void;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function ReportFieldFilterContent({values, selectedField, largeButton, style, onFieldSelected, onChange}: ReportFieldFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const reportFieldRef = useRef<ReportFieldHandle>(null);

    const [error, setError] = useState<string>();

    return (
        <>
            <ReportFieldBase
                ref={reportFieldRef}
                values={values}
                hasFeed={!!values?.feed}
                selectedField={selectedField}
                onFieldSelected={onFieldSelected}
                onError={setError}
                style={style}
            />
            {!!selectedField && (
                <Button
                    style={[styles.ph5, styles.pb5, styles.pt3, styles.mtAuto]}
                    success
                    large={largeButton}
                    text={translate('common.apply')}
                    pressOnEnter
                    onPress={() => {
                        if (error) {
                            return;
                        }

                        const value = reportFieldRef.current?.applySelectedFieldAndGoBack();
                        if (!value) {
                            return;
                        }

                        onChange(value);
                    }}
                />
            )}
        </>
    );
}

export default ReportFieldFilterContent;
export type {ReportFieldFilterContentProps};
