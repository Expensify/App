import ScrollView from '@components/ScrollView';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey} from '@components/Search/types';
import TextInput from '@components/TextInput';

import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {PolicyReportField} from '@src/types/onyx';

import React from 'react';

type ReportFieldTextProps = {
    filterKey: ReportFieldTextKey;
    field: PolicyReportField;
    value: string | undefined;
    footer?: React.ReactNode;
    shouldUseScrollView?: boolean;
    onChange: (newValue: string) => void;
    onError: (error: string | undefined) => void;
};

function ReportFieldText({filterKey, field, value, footer, shouldUseScrollView, onChange, onError}: ReportFieldTextProps) {
    const styles = useThemeStyles();
    const shouldFooterBeInsideList = useShouldFooterBeInsideList();
    const error = useTextFilterValidation(filterKey, value, onError);

    const input = (
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

    if (!shouldUseScrollView) {
        return (
            <>
                {input}
                {footer}
            </>
        );
    }

    return (
        <>
            <ScrollView
                style={styles.flexShrink1}
                keyboardShouldPersistTaps="handled"
            >
                {input}
                {shouldFooterBeInsideList && footer}
            </ScrollView>
            {!shouldFooterBeInsideList && footer}
        </>
    );
}

export default ReportFieldText;
