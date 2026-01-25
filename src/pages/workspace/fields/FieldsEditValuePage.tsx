import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
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
import {hasAccountingConnections} from '@libs/PolicyUtils';
import {validateReportFieldListValueName} from '@libs/WorkspaceReportFieldUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {renameReportFieldsListValue} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldForm';
import type {Policy} from '@src/types/onyx';
import type {OnyxEntry} from 'react-native-onyx';

type FieldsEditValuePageProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    valueIndex: number;
    featureName: ValueOf<typeof CONST.POLICY.MORE_FEATURES>;
    testID: string;
};

function FieldsEditValuePage({policy, policyID, valueIndex, featureName, testID}: FieldsEditValuePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {canBeMissing: true});

    const currentValueName = formDraft?.listValues?.[valueIndex] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) =>
            validateReportFieldListValueName(values[INPUT_IDS.NEW_VALUE_NAME].trim(), currentValueName, formDraft?.[INPUT_IDS.LIST_VALUES] ?? [], INPUT_IDS.NEW_VALUE_NAME, translate),
        [currentValueName, formDraft, translate],
    );

    const editValue = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM>) => {
            const valueName = values[INPUT_IDS.NEW_VALUE_NAME]?.trim();
            if (currentValueName !== valueName) {
                renameReportFieldsListValue({
                    valueIndex,
                    newValueName: valueName,
                    listValues: formDraft?.[INPUT_IDS.LIST_VALUES] ?? [],
                });
            }
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [currentValueName, formDraft, valueIndex],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={featureName}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID={testID}
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
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <InputWrapper
                        InputComponent={TextInput}
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

export default FieldsEditValuePage;
