import React, {useMemo, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCustomSegments} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {NetSuiteCustomFieldMapping} from '@src/types/onyx/Policy';
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
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

    const config = policy?.connections?.netsuite?.options?.config;
    const customSegments = useMemo(() => config?.syncOptions?.customSegments ?? [], [config?.syncOptions]);
    const [addCustomSegmentFormDraft] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM_DRAFT);

    const submit = () => {
        const updatedCustomSegments = customSegments.concat([
            {
                segmentName: addCustomSegmentFormDraft?.[INPUT_IDS.SEGMENT_NAME] ?? '',
                internalID: addCustomSegmentFormDraft?.[INPUT_IDS.INTERNAL_ID] ?? '',
                scriptID: addCustomSegmentFormDraft?.[INPUT_IDS.SCRIPT_ID] ?? '',
                mapping: (addCustomSegmentFormDraft?.[INPUT_IDS.MAPPING] as NetSuiteCustomFieldMapping) ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            },
        ]);
        updateNetSuiteCustomSegments(policyID, updatedCustomSegments, customSegments);

        FormActions.clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM);
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS));
    };

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
    } = useSubStep<CustomFieldSubStepWithPolicy>({bodyContent: formSteps, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS));
            return;
        }
        ref.current?.movePrevious();
        prevScreen();
    };

    const handleNextScreen = () => {
        ref.current?.moveNext();
        nextScreen();
    };

    const segmentType = addCustomSegmentFormDraft?.[INPUT_IDS.CUSTOM_SEGMENT_TYPE];

    return (
        <ConnectionLayout
            displayName={NetSuiteImportAddCustomSegmentPage.displayName}
            headerTitle={`workspace.netsuite.import.importCustomFields.customSegments.${segmentType ? `addForm.${segmentType}AddTitle` : 'addText'}` as TranslationPaths}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={handleBackButtonPress}
            shouldIncludeSafeAreaPaddingBottom
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={0}
                    stepNames={CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT_STEP_NAMES}
                />
            </View>
            <View style={[styles.flexGrow1, styles.mt3]}>
                <SubStep
                    isEditing={isEditing}
                    onNext={handleNextScreen}
                    onMove={moveTo}
                    screenIndex={screenIndex}
                    policyID={policyID}
                    policy={policy}
                    importCustomField={CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS}
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteImportAddCustomSegmentPage.displayName = 'NetSuiteImportAddCustomSegmentPage';

export default withPolicyConnections(NetSuiteImportAddCustomSegmentPage);
