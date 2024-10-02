import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import ChooseSegmentTypeStep from './substeps/ChooseSegmentTypeStep';
import ConfirmCustomSegmentList from './substeps/ConfirmCustomSegmentList';
import CustomSegmentInternalIdStep from './substeps/CustomSegmentInternalIdStep';
import CustomSegmentNameStep from './substeps/CustomSegmentNameStep';
import CustomSegmentScriptIdStep from './substeps/CustomSegmentScriptIdStep';
import MappingStep from './substeps/MappingStep';

const formSteps = [ChooseSegmentTypeStep, CustomSegmentNameStep, CustomSegmentInternalIdStep, CustomSegmentScriptIdStep, MappingStep, ConfirmCustomSegmentList];

function NetSuiteImportAddCustomSegmentPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);
    const formRef = useRef<FormRef | null>(null);

    const config = policy?.connections?.netsuite?.options?.config;
    const customSegments = useMemo(() => config?.syncOptions?.customSegments ?? [], [config?.syncOptions]);

    const handleFinishStep = useCallback(() => {
        InteractionManager.runAfterInteractions(() => {
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS));
        });
    }, [policyID]);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
        goToTheLastStep,
    } = useSubStep<CustomFieldSubStepWithPolicy>({bodyContent: formSteps, startFrom: CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE, onFinished: handleFinishStep});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // Clicking back on the first screen should go back to listing
        if (screenIndex === CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE) {
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS));
            return;
        }
        ref.current?.movePrevious();
        formRef.current?.resetErrors();
        prevScreen();
    };

    const handleNextScreen = useCallback(() => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        ref.current?.moveNext();
        nextScreen();
    }, [goToTheLastStep, isEditing, nextScreen]);

    const [customSegmentType, setCustomSegmentType] = useState<ValueOf<typeof CONST.NETSUITE_CUSTOM_RECORD_TYPES> | undefined>();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM> = {};
            const customSegmentRecordType = customSegmentType ?? CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;
            switch (screenIndex) {
                case CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_NAME:
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.SEGMENT_NAME])) {
                        errors[INPUT_IDS.SEGMENT_NAME] = translate('workspace.netsuite.import.importCustomFields.requiredFieldError', {
                            fieldName: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.${customSegmentRecordType}Name`),
                        });
                    } else if (customSegments.find((customSegment) => customSegment.segmentName.toLowerCase() === values[INPUT_IDS.SEGMENT_NAME].toLowerCase())) {
                        const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.customSegments.fields.segmentName`);
                        errors[INPUT_IDS.SEGMENT_NAME] = translate('workspace.netsuite.import.importCustomFields.customSegments.errors.uniqueFieldError', {fieldName: fieldLabel});
                    }
                    return errors;
                case CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.INTERNAL_ID:
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.INTERNAL_ID])) {
                        const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.customSegments.fields.internalID`);
                        errors[INPUT_IDS.INTERNAL_ID] = translate('workspace.netsuite.import.importCustomFields.requiredFieldError', {fieldName: fieldLabel});
                    } else if (customSegments.find((customSegment) => customSegment.internalID.toLowerCase() === values[INPUT_IDS.INTERNAL_ID].toLowerCase())) {
                        const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.customSegments.fields.internalID`);
                        errors[INPUT_IDS.INTERNAL_ID] = translate('workspace.netsuite.import.importCustomFields.customSegments.errors.uniqueFieldError', {fieldName: fieldLabel});
                    }
                    return errors;
                case CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SCRIPT_ID:
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.SCRIPT_ID])) {
                        const fieldLabel = translate(
                            `workspace.netsuite.import.importCustomFields.customSegments.fields.${
                                customSegmentRecordType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT ? 'scriptID' : 'customRecordScriptID'
                            }`,
                        );
                        errors[INPUT_IDS.SCRIPT_ID] = translate('workspace.netsuite.import.importCustomFields.requiredFieldError', {fieldName: fieldLabel});
                    } else if (customSegments.find((customSegment) => customSegment.scriptID.toLowerCase() === values[INPUT_IDS.SCRIPT_ID].toLowerCase())) {
                        const fieldLabel = translate(
                            `workspace.netsuite.import.importCustomFields.customSegments.fields.${
                                customSegmentRecordType === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT ? 'scriptID' : 'customRecordScriptID'
                            }`,
                        );
                        errors[INPUT_IDS.SCRIPT_ID] = translate('workspace.netsuite.import.importCustomFields.customSegments.errors.uniqueFieldError', {fieldName: fieldLabel});
                    }
                    return errors;
                case CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.MAPPING:
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.MAPPING])) {
                        errors[INPUT_IDS.MAPPING] = translate('common.error.pleaseSelectOne');
                    }
                    return errors;
                default:
                    return errors;
            }
        },
        [customSegmentType, customSegments, screenIndex, translate],
    );

    const updateNetSuiteCustomSegments = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM>) => {
            const updatedCustomSegments = customSegments.concat([
                {
                    segmentName: formValues[INPUT_IDS.SEGMENT_NAME],
                    internalID: formValues[INPUT_IDS.INTERNAL_ID],
                    scriptID: formValues[INPUT_IDS.SCRIPT_ID],
                    mapping: formValues[INPUT_IDS.MAPPING] ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                },
            ]);
            Connections.updateNetSuiteCustomSegments(
                policyID,
                updatedCustomSegments,
                customSegments,
                `${CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS}_${customSegments.length}`,
                CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            );
            nextScreen();
        },
        [customSegments, nextScreen, policyID],
    );

    const renderSubStepContent = useMemo(
        () => (
            <SubStep
                isEditing={isEditing}
                onNext={handleNextScreen}
                onMove={moveTo}
                screenIndex={screenIndex}
                policyID={policyID}
                policy={policy}
                importCustomField={CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS}
                customSegmentType={customSegmentType}
                setCustomSegmentType={setCustomSegmentType}
            />
        ),
        [SubStep, handleNextScreen, isEditing, moveTo, policy, policyID, screenIndex, customSegmentType],
    );

    const selectionListForm = [CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.MAPPING as number].includes(screenIndex);
    const submitFlexAllowed = [
        CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_NAME as number,
        CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.INTERNAL_ID as number,
        CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SCRIPT_ID as number,
    ].includes(screenIndex);

    return (
        <ConnectionLayout
            displayName={NetSuiteImportAddCustomSegmentPage.displayName}
            headerTitle={`workspace.netsuite.import.importCustomFields.customSegments.${customSegmentType ? `addForm.${customSegmentType}AddTitle` : 'addText'}` as TranslationPaths}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={handleBackButtonPress}
            shouldIncludeSafeAreaPaddingBottom
            shouldUseScrollView={false}
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE}
                    stepNames={CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT_STEP_NAMES}
                />
            </View>
            <View style={[styles.flexGrow1, styles.mt3]}>
                {screenIndex === CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE ? (
                    renderSubStepContent
                ) : (
                    <FormProvider
                        ref={formRef}
                        formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM}
                        submitButtonText={screenIndex === formSteps.length - 1 ? translate('common.confirm') : translate('common.next')}
                        onSubmit={screenIndex === formSteps.length - 1 ? updateNetSuiteCustomSegments : handleNextScreen}
                        validate={validate}
                        style={[styles.flexGrow1]}
                        submitButtonStyles={[styles.ph5, styles.mb0]}
                        shouldUseScrollView={!selectionListForm}
                        enabledWhenOffline
                        isSubmitDisabled={!!config?.pendingFields?.customSegments}
                        submitFlexEnabled={submitFlexAllowed}
                        shouldHideFixErrorsAlert={screenIndex === CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.MAPPING}
                    >
                        {renderSubStepContent}
                    </FormProvider>
                )}
            </View>
        </ConnectionLayout>
    );
}

NetSuiteImportAddCustomSegmentPage.displayName = 'NetSuiteImportAddCustomSegmentPage';

export default withPolicyConnections(NetSuiteImportAddCustomSegmentPage);
