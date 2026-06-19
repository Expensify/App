import React from 'react';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey} from '@components/Search/types';
import TextInput from '@components/TextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldTextProps = {
    filterKey: ReportFieldTextKey;
    field: PolicyReportField;
    value: string | undefined;
    onChange: (newValue: string) => void;
    onError: (error: string | undefined) => void;
};

function ReportFieldText({filterKey, field, value, onChange, onError}: ReportFieldTextProps) {
    const styles = useThemeStyles();
    const error = useTextFilterValidation(filterKey, value, onError);

    return (
        <TextInput
            placeholder={field.name}
            value={value}
            errorText={error}
            hasError={!!error}
            onChangeText={onChange}
            accessibilityLabel={field.name}
            role={CONST.ROLE.PRESENTATION}
            containerStyles={[styles.ph5, styles.pv2]}
        />
    );
}

export default ReportFieldText;
