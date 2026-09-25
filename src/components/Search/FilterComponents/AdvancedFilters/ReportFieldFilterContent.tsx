import Button from '@components/Button';
import ReportFieldBase from '@components/Search/FilterComponents/ReportField';
import type {ReportFieldHandle} from '@components/Search/FilterComponents/ReportField';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {PolicyReportField} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useRef, useState} from 'react';

type ReportFieldFilterContentProps = {
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    selectedField: PolicyReportField | null;
    size?: Exclude<ValueOf<typeof CONST.BUTTON_SIZE>, typeof CONST.BUTTON_SIZE.SMALL>;
    style?: StyleProp<ViewStyle>;
    onFieldSelected: (field: PolicyReportField | null) => void;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function ReportFieldFilterContent({values, selectedField, size, style, onFieldSelected, onChange}: ReportFieldFilterContentProps) {
    const {translate} = useLocalize();
    const reportFieldRef = useRef<ReportFieldHandle>(null);

    const [error, setError] = useState<string>();

    const applyButton = (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={size}
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
        >
            <Button.KeyboardShortcut />
            <Button.Text>{translate('common.apply')}</Button.Text>
        </Button>
    );

    return (
        <ReportFieldBase
            ref={reportFieldRef}
            values={values}
            hasFeed={!!values?.feed}
            selectedField={selectedField}
            footer={applyButton}
            shouldUseScrollView
            onFieldSelected={onFieldSelected}
            onError={setError}
            style={style}
        />
    );
}

export default ReportFieldFilterContent;
export type {ReportFieldFilterContentProps};
