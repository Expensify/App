import React, {useCallback, useMemo, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import type {FormRef} from '@components/Form/types';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {CustomFieldSubPageWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import {updateNetSuiteCustomLists} from '@userActions/connections/NetSuiteCommands';
import {clearDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {NetSuiteCustomFieldForm} from '@src/types/form/NetSuiteCustomFieldForm';
import {getCustomListInitialSubstep, getSubstepValues} from './customUtils';
import ChooseCustomListStep from './substeps/ChooseCustomListStep';
import ConfirmCustomListStep from './substeps/ConfirmCustomListStep';
import CustomListMappingStep from './substeps/CustomListMappingStep';
import TransactionFieldIDStep from './substeps/TransactionFieldIDStep';

type NetSuiteImportAddCustomListContentProps = {
    policy: WithPolicyConnectionsProps['policy'];
    route: WithPolicyConnectionsProps['route'];
    draftValues: OnyxEntry<NetSuiteCustomFieldForm>;
};

const pages = [
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.NAME, component: ChooseCustomListStep},
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.FIELD_ID, component: TransactionFieldIDStep},
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.MAPPING_TITLE, component: CustomListMappingStep},
    {pageName: CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.CONFIRM, component: ConfirmCustomListStep},
];

function NetSuiteImportAddCustomListContent({policy, draftValues, route}: NetSuiteImportAddCustomListContentProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const formRef = useRef<FormRef | null>(null);

    const values = useMemo(() => getSubstepValues(draftValues), [draftValues]);
    const startFrom = useMemo(() => getCustomListInitialSubstep(values), [values]);

    const config = policy?.connections?.netsuite?.options?.config;
    const customLists = useMemo(() => config?.syncOptions?.customLists ?? [], [config?.syncOptions]);

    const handleFinishStep = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            const updatedCustomLists = customLists.concat([
                {
                    listName: values[INPUT_IDS.LIST_NAME],
                    internalID: values[INPUT_IDS.INTERNAL_ID],
                    transactionFieldID: values[INPUT_IDS.TRANSACTION_FIELD_ID],
                    mapping: values[INPUT_IDS.MAPPING] ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                },
            ]);
            updateNetSuiteCustomLists(
                policyID,
                updatedCustomLists,
                customLists,
                `${CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS}_${customLists.length}`,
                CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            );
            clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM);
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS));
        });
    }, [values, customLists, policyID]);

    const {CurrentPage, isEditing, nextPage, prevPage, pageIndex, moveTo} = useSubPage<CustomFieldSubPageWithPolicy>({
        pages,
        startFrom,
        onFinished: handleFinishStep,
        buildRoute: (pageName, action) => ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.getRoute(route.params.policyID, pageName, action),
    });

    const goBackToConfirmStep = () => {
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.getRoute(route.params.policyID, CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.CONFIRM));
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            goBackToConfirmStep();
            return;
        }

        // Clicking back on the first screen should go back to listing
        if (pageIndex === CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER) {
            clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM);
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS));
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
    }, [isEditing, goBackToConfirmStep, nextPage]);

    return (
        <ConnectionLayout
            displayName="NetSuiteImportAddCustomListContent"
            headerTitle="workspace.netsuite.import.importCustomFields.customLists.addText"
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
                    stepNames={CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.STEP_INDEX_LIST}
                />
            </View>
            <View style={[styles.flexGrow1, styles.mt3]}>
                <CurrentPage
                    isEditing={isEditing}
                    onNext={handleNextScreen}
                    onMove={moveTo}
                    policyID={policyID}
                    policy={policy}
                    importCustomField={CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS}
                    netSuiteCustomFieldFormValues={values}
                    customLists={customLists}
                />
            </View>
        </ConnectionLayout>
    );
}

export default NetSuiteImportAddCustomListContent;
