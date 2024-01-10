import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type EditReportFieldDatePageProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Name of the policy report field */
    fieldName: string;

    /** ID of the policy report field */
    fieldID: string;

    /** Callback to fire when the Save button is pressed  */
    onSubmit: () => void;
};

function EditReportFieldDatePage({fieldName, onSubmit, fieldValue, fieldID}: EditReportFieldDatePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const inputRef = useRef<HTMLInputElement>(null);

    const validate = useCallback(
        (value: Record<string, string>) => {
            const errors: Record<string, string> = {};
            if (value[fieldID].trim() === '') {
                errors[fieldID] = 'common.error.fieldRequired';
            }
            return errors;
        },
        [fieldID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => inputRef.current?.focus()}
            testID={EditReportFieldDatePage.displayName}
        >
            <HeaderWithBackButton title={fieldName} />
            {/* @ts-expect-error TODO: TS migration */}
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.POLICY_REPORT_FIELD_EDIT_FORM}
                onSubmit={onSubmit}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        // @ts-expect-error TODO: TS migration
                        InputComponent={DatePicker}
                        inputID={fieldID}
                        name={fieldID}
                        defaultValue={fieldValue}
                        label={fieldName}
                        accessibilityLabel={fieldName}
                        role={CONST.ROLE.PRESENTATION}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        ref={inputRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EditReportFieldDatePage.displayName = 'EditReportFieldDatePage';

export default EditReportFieldDatePage;
