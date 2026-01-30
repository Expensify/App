import React, {useCallback, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import type {FormRef} from '@components/Form/types';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {CustomFieldSubPageWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import {updateNetSuiteCustomSegments} from '@userActions/connections/NetSuiteCommands';
import {clearDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {NetSuiteCustomFieldForm} from '@src/types/form/NetSuiteCustomFieldForm';
import {getCustomSegmentInitialSubstep, getSubstepValues} from './customUtils';
import ChooseSegmentTypeStep from './substeps/ChooseSegmentTypeStep';
import ConfirmCustomSegmentStep from './substeps/ConfirmCustomSegmentList';
import CustomSegmentInternalIdStep from './substeps/CustomSegmentInternalIdStep';
import CustomSegmentMappingStep from './substeps/CustomSegmentMappingStep';
import CustomSegmentNameStep from './substeps/CustomSegmentNameStep';
import CustomSegmentScriptIdStep from './substeps/CustomSegmentScriptIdStep';

type NetSuiteImportAddCustomSegmentContentProps = {
    policy: WithPolicyConnectionsProps['policy'];
    route: WithPolicyConnectionsProps['route'];
    draftValues: OnyxEntry<NetSuiteCustomFieldForm>;
};

const pages = [
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT.PAGE_NAME.TYPE, component: ChooseSegmentTypeStep},
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT.PAGE_NAME.NAME, component: CustomSegmentNameStep},
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT.PAGE_NAME.INTERNAL_ID, component: CustomSegmentInternalIdStep},
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT.PAGE_NAME.SCRIPT_ID, component: CustomSegmentScriptIdStep},
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT.PAGE_NAME.MAPPING_TITLE, component: CustomSegmentMappingStep},
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT.PAGE_NAME.CONFIRM, component: ConfirmCustomSegmentStep},
];

function NetSuiteImportAddCustomSegmentContent({policy, route, draftValues}: NetSuiteImportAddCustomSegmentContentProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();
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

    const {CurrentPage, isEditing, nextPage, prevPage, pageIndex, moveTo} = useSubPage<CustomFieldSubPageWithPolicy>({
        pages,
        startFrom,
        onFinished: handleFinishStep,
        buildRoute: (pageName, action) => ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD.getRoute(route.params.policyID, pageName, action),
    });

    const goBackToConfirmStep = () => {
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD.getRoute(route.params.policyID, CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT.PAGE_NAME.CONFIRM));
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            goBackToConfirmStep();
            return;
        }

        // Clicking back on the first screen should go back to listing
        if (pageIndex === CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE) {
            clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM);
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS));
            return;
        }
        formRef.current?.resetErrors();
        prevPage();
    };

    const handleNextScreen = useCallback(() => {
        if (isEditing) {
            goBackToConfirmStep();
            return;
        }
        nextPage();
    }, [goBackToConfirmStep, isEditing, nextPage]);

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
                <InteractiveStepSubPageHeader
                    currentStepIndex={pageIndex}
                    stepNames={CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_SEGMENT.STEP_INDEX_LIST}
                />
            </View>
            <View style={[styles.flex1, styles.mt3]}>
                <CurrentPage
                    isEditing={isEditing}
                    onNext={handleNextScreen}
                    onMove={moveTo}
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
