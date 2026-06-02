import React from 'react';
import TextInput from '@components/TextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldTextProps = {
    field: PolicyReportField;
    value: string;
    onChange: (newValue: string) => void;
};

function ReportFieldText({field, value, onChange}: ReportFieldTextProps) {
    const styles = useThemeStyles();

    return (
        <TextInput
            placeholder={field.name}
            value={value}
            onChangeText={onChange}
            accessibilityLabel={field.name}
            role={CONST.ROLE.PRESENTATION}
            containerStyles={[styles.ph5, styles.mb2]}
        />
    );
}

export default ReportFieldText;
