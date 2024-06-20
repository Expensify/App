import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldsForm';
import TypeSelector from './TypeSelector';

type CreatePolicyReportFieldPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_CREATE>;

// TODO: Add translation here
function CreatePolicyReportFieldPage({
    // policy,
    route: {
        params: {policyID},
    },
}: CreatePolicyReportFieldPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const submitForm = useCallback(({name, type, initialValue}: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
        // eslint-disable-next-line no-console
        console.log('submitForm', name, type, initialValue);
        Navigation.goBack();
    }, []);

    const validateForm = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> = {};

        // TODO: Add validation logic here
        // eslint-disable-next-line no-console
        console.log('validateForm', values);

        return errors;
    }, []);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORTFIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={CreatePolicyReportFieldPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.reportFields.addField')}
                    onBackButtonPress={Navigation.goBack}
                />
                <FormProvider
                    style={[styles.mh5, styles.flex1]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM}
                    onSubmit={submitForm}
                    validate={validateForm}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldValidateOnBlur={false}
                    disablePressOnEnter={false}
                >
                    <View style={styles.mhn5}>
                        <InputWrapper
                            InputComponent={TextPicker}
                            inputID={INPUT_IDS.NAME}
                            label={translate('common.name')}
                            description={translate('common.name')}
                            rightLabel={translate('common.required')}
                            accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            maxLength={CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH}
                            multiline={false}
                            role={CONST.ROLE.PRESENTATION}
                        />
                        <InputWrapper
                            InputComponent={TypeSelector}
                            label="Type"
                            inputID={INPUT_IDS.TYPE}
                        />
                        <InputWrapper
                            InputComponent={TextPicker}
                            inputID={INPUT_IDS.INITIAL_VALUE}
                            label="Initial value"
                            // label={translate('common.name')}
                            description="Initial value"
                            // description={translate('common.name')}
                            accessibilityLabel="Initial value"
                            // accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            maxLength={CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH}
                            multiline={false}
                            role={CONST.ROLE.PRESENTATION}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CreatePolicyReportFieldPage.displayName = 'CreatePolicyReportFieldPage';

export default withPolicyAndFullscreenLoading(CreatePolicyReportFieldPage);
