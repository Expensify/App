import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {OnyxFormValuesFields} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

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
    const inputRef = useRef<AnimatedTextInputRef>(null);

    const validate = useCallback(
        (values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.POLICY_REPORT_FIELD_EDIT_FORM>) => {
            const errors: Errors = {};
            const value = values[fieldID];
            if (typeof value === 'string' && value.trim() === '') {
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
