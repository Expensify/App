import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasAccountingConnections as hasAccountingConnectionsPolicyUtils} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import {getReportFieldInitialValue} from '@libs/WorkspaceReportFieldUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {updateReportFieldInitialValue} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import ReportFieldsInitialListValuePicker from './InitialListValueSelector/ReportFieldsInitialListValuePicker';

type ReportFieldsInitialValuePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE>;
function ReportFieldsInitialValuePage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsInitialValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const reportField = policy?.fieldList?.[getReportFieldKey(reportFieldID)] ?? null;
    const availableListValuesLength = (reportField?.disabledOptions ?? []).filter((disabledListValue) => !disabledListValue).length;
    const currentInitialValue = getReportFieldInitialValue(reportField);
    const [initialValue, setInitialValue] = useState(currentInitialValue);

    const submitForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
            if (currentInitialValue !== values.initialValue) {
                updateReportFieldInitialValue(policyID, reportFieldID, values.initialValue);
            }
            Navigation.goBack();
        },
        [policyID, reportFieldID, currentInitialValue],
    );

    const submitListValueUpdate = (value: string) => {
        updateReportFieldInitialValue(policyID, reportFieldID, currentInitialValue === value ? '' : value);
        Navigation.goBack();
    };

    const validateForm = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> => {
            const {initialValue: formInitialValue} = values;
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM> = {};

            if (reportField?.type === CONST.REPORT_FIELD_TYPES.TEXT && formInitialValue.length > CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
                errors[INPUT_IDS.INITIAL_VALUE] = translate('common.error.characterLimitExceedCounter', {
                    length: formInitialValue.length,
                    limit: CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH,
                });
            }

            if (reportField?.type === CONST.REPORT_FIELD_TYPES.LIST && availableListValuesLength > 0 && !isRequiredFulfilled(formInitialValue)) {
                errors[INPUT_IDS.INITIAL_VALUE] = translate('workspace.reportFields.reportFieldInitialValueRequiredError');
            }

            return errors;
        },
        [availableListValuesLength, reportField?.type, translate],
    );

    if (!reportField || hasAccountingConnections) {
        return <NotFoundPage />;
    }

    const isTextFieldType = reportField.type === CONST.REPORT_FIELD_TYPES.TEXT;
    const isListFieldType = reportField.type === CONST.REPORT_FIELD_TYPES.LIST;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                style={styles.defaultModalContainer}
                testID={ReportFieldsInitialValuePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.initialValue')}
                    onBackButtonPress={Navigation.goBack}
                />
                {isListFieldType && (
                    <View style={[styles.ph5, styles.pb4]}>
                        <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listValuesInputSubtitle')}</Text>
                    </View>
                )}

                {isTextFieldType && (
                    <FormProvider
                        formID={ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM}
                        onSubmit={submitForm}
                        submitButtonText={translate('common.save')}
                        validate={validateForm}
                        style={styles.flex1}
                        enabledWhenOffline
                        isSubmitButtonVisible={isTextFieldType}
                        submitButtonStyles={styles.mh5}
                    >
                        <InputWrapper
                            containerStyles={styles.mh5}
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.INITIAL_VALUE}
                            label={translate('common.initialValue')}
                            accessibilityLabel={translate('workspace.editor.initialValueInputLabel')}
                            multiline={false}
                            value={initialValue}
                            role={CONST.ROLE.PRESENTATION}
                            ref={inputCallbackRef}
                            onChangeText={setInitialValue}
                        />
                    </FormProvider>
                )}
                {isListFieldType && (
                    <ReportFieldsInitialListValuePicker
                        listValues={reportField.values}
                        disabledOptions={reportField.disabledOptions}
                        value={initialValue}
                        onValueChange={submitListValueUpdate}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ReportFieldsInitialValuePage.displayName = 'ReportFieldsInitialValuePage';

export default withPolicyAndFullscreenLoading(ReportFieldsInitialValuePage);
