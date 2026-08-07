import Button from '@components/ButtonComposed';
import ReportFieldBase from '@components/Search/FilterComponents/ReportField';
import type {ReportFieldHandle} from '@components/Search/FilterComponents/ReportField';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

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
            )}
        </>
    );
}

export default ReportFieldFilterContent;
export type {ReportFieldFilterContentProps};
