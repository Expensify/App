import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import type {PolicyFeature} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import {isReportFieldTargetValid, validateReportFieldListValueName} from '@libs/WorkspaceReportFieldUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {addReportFieldListValue, createReportFieldsListValue} from '@userActions/Policy/ReportField';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useCallback, useMemo} from 'react';
import {Keyboard} from 'react-native';

type FieldsAddListValuePageProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    reportFieldID?: string;
    featureName: ValueOf<typeof CONST.POLICY.MORE_FEATURES>;
    policyFeature: PolicyFeature;
    expectedTarget: ValueOf<typeof CONST.REPORT_FIELD_TARGETS>;
    testID: string;
};

function FieldsAddListValuePage({policy, policyID, reportFieldID, featureName, policyFeature, expectedTarget, testID}: FieldsAddListValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);
    const {canWrite} = usePolicyFeatureWriteAccess(policy, policyFeature);
    const reportField = reportFieldID ? policy?.fieldList?.[getReportFieldKey(reportFieldID)] : undefined;
    const isReportFieldInvalid = !!reportFieldID && (!reportField || !isReportFieldTargetValid(reportField, expectedTarget));
    const draftListValues = formDraft?.[INPUT_IDS.LIST_VALUES];
    const draftDisabledListValues = formDraft?.[INPUT_IDS.DISABLED_LIST_VALUES];

    const listValues = useMemo(() => {
        let reportFieldListValues: string[];
        if (reportFieldID) {
            reportFieldListValues = Object.values(reportField?.values ?? {});
        } else {
            reportFieldListValues = draftListValues ?? [];
        }
        return reportFieldListValues;
    }, [draftListValues, reportField?.values, reportFieldID]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) =>
            validateReportFieldListValueName(values[INPUT_IDS.VALUE_NAME].trim(), '', listValues, INPUT_IDS.VALUE_NAME, translate),
        [listValues, translate],
    );

    const createValue = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
            if (reportFieldID) {
                addReportFieldListValue({policy, reportFieldID, valueName: values[INPUT_IDS.VALUE_NAME]});
            } else {
                createReportFieldsListValue({
                    valueName: values[INPUT_IDS.VALUE_NAME],
                    listValues: draftListValues ?? [],
                    disabledListValues: draftDisabledListValues ?? [],
                });
            }
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [draftDisabledListValues, draftListValues, policy, reportFieldID],
    );

    if (isReportFieldInvalid) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={featureName}
            policyFeature={policyFeature}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID={testID}
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
                    isSubmitButtonVisible={canWrite}
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
                        disabled={!canWrite}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FieldsAddListValuePage;
