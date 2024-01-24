import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type EditReportFieldTextPageProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Name of the policy report field */
    fieldName: string;

    /** ID of the policy report field */
    fieldID: string;

    /** Callback to fire when the Save button is pressed  */
    onSubmit: () => void;
};

function EditReportFieldTextPage({fieldName, onSubmit, fieldValue, fieldID}: EditReportFieldTextPageProps) {
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
            testID={EditReportFieldTextPage.displayName}
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
                        InputComponent={TextInput}
                        inputID={fieldID}
                        name={fieldID}
                        defaultValue={fieldValue}
                        label={fieldName}
                        accessibilityLabel={fieldName}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EditReportFieldTextPage.displayName = 'EditReportFieldTextPage';

export default EditReportFieldTextPage;
