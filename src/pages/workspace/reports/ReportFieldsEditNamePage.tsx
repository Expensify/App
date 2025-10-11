import React, {useCallback, useState} from 'react';
import {Keyboard} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {updateReportField} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';

type ReportFieldsEditNamePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_NAME>;

function ReportFieldsEditNamePage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsEditNamePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const reportFieldKey = getReportFieldKey(reportFieldID);
    const reportField = policy?.fieldList?.[reportFieldKey];
    const currentName = reportField?.name ?? '';
    const [name, setName] = useState(currentName);

    const submitForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
            const newName = values[INPUT_IDS.NAME]?.trim();
            if (newName !== currentName) {
                updateReportField(policyID, reportFieldID, {name: newName});
            }
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [currentName, policyID, reportFieldID],
    );

    const validateForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> => {
            const {name: formName} = values;
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> = {};

            if (!isRequiredFulfilled(formName)) {
                errors[INPUT_IDS.NAME] = translate('workspace.reportFields.reportFieldNameRequiredError');
            } else if (Object.values(policy?.fieldList ?? {}).some((field) => field.name === formName && field.fieldID !== reportFieldID)) {
                errors[INPUT_IDS.NAME] = translate('workspace.reportFields.existingReportFieldNameError');
            } else if ([...formName].length > CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
                errors[INPUT_IDS.NAME] = translate('common.error.characterLimitExceedCounter', {
                    length: [...formName].length,
                    limit: CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH,
                });
            }

            return errors;
        },
        [policy?.fieldList, reportFieldID, translate],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID={ReportFieldsEditNamePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.name')}
                    onBackButtonPress={Navigation.goBack}
                />
                <FormProvider
                    addBottomSafeAreaPadding
                    formID={ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM}
                    onSubmit={submitForm}
                    submitButtonText={translate('common.save')}
                    validate={validateForm}
                    style={styles.flex1}
                    enabledWhenOffline
                    submitButtonStyles={styles.mh5}
                    shouldHideFixErrorsAlert
                >
                    <InputWrapper
                        containerStyles={styles.mh5}
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.NAME}
                        label={translate('common.name')}
                        accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                        maxLength={CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH}
                        multiline={false}
                        value={name}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        onChangeText={setName}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ReportFieldsEditNamePage.displayName = 'ReportFieldsEditNamePage';

export default withPolicyAndFullscreenLoading(ReportFieldsEditNamePage);
