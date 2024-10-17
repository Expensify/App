import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportField from '@libs/actions/Policy/ReportField';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as WorkspaceReportFieldUtils from '@libs/WorkspaceReportFieldUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';

type ReportFieldsEditValuePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_VALUE>;

function ReportFieldsEditValuePage({
    policy,
    route: {
        params: {policyID, valueIndex},
    },
}: ReportFieldsEditValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

    const currentValueName = formDraft?.listValues?.[valueIndex] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) =>
            WorkspaceReportFieldUtils.validateReportFieldListValueName(
                values[INPUT_IDS.NEW_VALUE_NAME].trim(),
                currentValueName,
                formDraft?.[INPUT_IDS.LIST_VALUES] ?? [],
                INPUT_IDS.NEW_VALUE_NAME,
            ),
        [currentValueName, formDraft],
    );

    const editValue = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
            const valueName = values[INPUT_IDS.NEW_VALUE_NAME]?.trim();
            if (currentValueName !== valueName) {
                ReportField.renameReportFieldsListValue(valueIndex, valueName);
            }
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [currentValueName, valueIndex],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            shouldBeBlocked={PolicyUtils.hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={styles.defaultModalContainer}
                testID={ReportFieldsEditValuePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.reportFields.editValue')}
                    onBackButtonPress={Navigation.goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM}
                    onSubmit={editValue}
                    submitButtonText={translate('common.save')}
                    validate={validate}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        maxLength={CONST.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH}
                        defaultValue={currentValueName}
                        label={translate('common.value')}
                        accessibilityLabel={translate('common.value')}
                        inputID={INPUT_IDS.NEW_VALUE_NAME}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ReportFieldsEditValuePage.displayName = 'ReportFieldsEditValuePage';

export default withPolicyAndFullscreenLoading(ReportFieldsEditValuePage);
