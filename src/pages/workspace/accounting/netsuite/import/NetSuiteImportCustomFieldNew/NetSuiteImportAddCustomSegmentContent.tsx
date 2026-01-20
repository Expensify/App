import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import type {FormRef} from '@components/Form/types';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import {updateNetSuiteCustomSegments} from '@userActions/connections/NetSuiteCommands';
import {clearDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {NetSuiteCustomFieldForm} from '@src/types/form/NetSuiteCustomFieldForm';
import type {Policy} from '@src/types/onyx';
import {getCustomSegmentInitialSubstep, getSubstepValues} from './customUtils';
import ChooseSegmentTypeStep from './substeps/ChooseSegmentTypeStep';
import ConfirmCustomSegmentStep from './substeps/ConfirmCustomSegmentList';
import CustomSegmentInternalIdStep from './substeps/CustomSegmentInternalIdStep';
import CustomSegmentMappingStep from './substeps/CustomSegmentMappingStep';
import CustomSegmentNameStep from './substeps/CustomSegmentNameStep';
import CustomSegmentScriptIdStep from './substeps/CustomSegmentScriptIdStep';

type NetSuiteImportAddCustomSegmentContentProps = {
    policy: OnyxEntry<Policy>;
    draftValues: OnyxEntry<NetSuiteCustomFieldForm>;
};

const formSteps = [ChooseSegmentTypeStep, CustomSegmentNameStep, CustomSegmentInternalIdStep, CustomSegmentScriptIdStep, CustomSegmentMappingStep, ConfirmCustomSegmentStep];

function NetSuiteImportAddCustomSegmentContent({policy, draftValues}: NetSuiteImportAddCustomSegmentContentProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);
    const formRef = useRef<FormRef | null>(null);

    const config = policy?.connections?.netsuite?.options?.config;
    const customSegments = useMemo(() => config?.syncOptions?.customSegments ?? [], [config?.syncOptions]);
    const [customSegmentType, setCustomSegmentType] = useState<ValueOf<typeof CONST.NETSUITE_CUSTOM_RECORD_TYPES> | undefined>();
    const values = useMemo(() => getSubstepValues(draftValues), [draftValues]);
    const startFrom = useMemo(() => getCustomSegmentInitialSubstep(values), [values]);
    const handleFinishStep = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            const updatedCustomSegments = customSegments.concat([
                {
                    segmentName: values[INPUT_IDS.SEGMENT_NAME],
                    internalID: values[INPUT_IDS.INTERNAL_ID],
                    scriptID: values[INPUT_IDS.SCRIPT_ID],
                    mapping: values[INPUT_IDS.MAPPING] ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                },
            ]);
            updateNetSuiteCustomSegments(
                policyID,
                updatedCustomSegments,
                customSegments,
                `${CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS}_${customSegments.length}`,
                CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            );
            clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM);

            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS));
        });
    }, [values, customSegments, policyID]);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
        goToTheLastStep,
    } = useSubStep<CustomFieldSubStepWithPolicy>({bodyContent: formSteps, startFrom, onFinished: handleFinishStep});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // Clicking back on the first screen should go back to listing
        if (screenIndex === CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE) {
            clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM);
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

    return (
        <ConnectionLayout
            displayName="NetSuiteImportAddCustomSegmentContent"
            headerTitle={`workspace.netsuite.import.importCustomFields.customSegments.${customSegmentType ? `addForm.${customSegmentType}AddTitle` : 'addText'}` as TranslationPaths}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={handleBackButtonPress}
            shouldUseScrollView={false}
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={startFrom}
                    stepNames={CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT_STEP_NAMES}
                />
            </View>
            <View style={[styles.flex1, styles.mt3]}>
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
                    netSuiteCustomFieldFormValues={values}
                    customSegments={customSegments}
                />
            </View>
        </ConnectionLayout>
    );
}

export default NetSuiteImportAddCustomSegmentContent;
