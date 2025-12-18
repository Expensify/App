import React, {useCallback, useMemo} from 'react';
import {Keyboard} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import {validateReportFieldListValueName} from '@libs/WorkspaceReportFieldUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {addReportFieldListValue, createReportFieldsListValue} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';

type ReportFieldsAddListValuePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_ADD_VALUE>;

function ReportFieldsAddListValuePage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsAddListValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {canBeMissing: true});

    const listValues = useMemo(() => {
        let reportFieldListValues: string[];
        if (reportFieldID) {
            const reportFieldKey = getReportFieldKey(reportFieldID);
            reportFieldListValues = Object.values(policy?.fieldList?.[reportFieldKey]?.values ?? {});
        } else {
            reportFieldListValues = formDraft?.[INPUT_IDS.LIST_VALUES] ?? [];
        }
        return reportFieldListValues;
    }, [formDraft, policy?.fieldList, reportFieldID]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) =>
            validateReportFieldListValueName(values[INPUT_IDS.VALUE_NAME].trim(), '', listValues, INPUT_IDS.VALUE_NAME),
        [listValues],
    );

    const createValue = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
            if (reportFieldID) {
                addReportFieldListValue({policy, reportFieldID, valueName: values[INPUT_IDS.VALUE_NAME]});
            } else {
                createReportFieldsListValue({
                    valueName: values[INPUT_IDS.VALUE_NAME],
                    listValues: formDraft?.[INPUT_IDS.LIST_VALUES] ?? [],
                    disabledListValues: formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES] ?? [],
                });
            }
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [formDraft, policy, reportFieldID],
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
                testID="ReportFieldsAddListValuePage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.reportFields.addValue')}
                    onBackButtonPress={Navigation.goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM}
                    onSubmit={createValue}
                    submitButtonText={translate('common.save')}
                    validate={validate}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        label={translate('common.value')}
                        accessibilityLabel={translate('common.value')}
                        inputID={INPUT_IDS.VALUE_NAME}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsAddListValuePage);
