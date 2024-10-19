import React, {useCallback, useMemo, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {InteractionManager, View} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import type {FormOnyxValues, FormRef} from '@components/Form/types';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as FormActions from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS, {NetSuiteCustomFieldForm} from '@src/types/form/NetSuiteCustomFieldForm';
import {Policy} from '@src/types/onyx';
import {getCustomListInitialSubstep, getSubstepValues} from './customListUtils';
import ChooseCustomListStep from './substeps/ChooseCustomListStep';
import ConfirmCustomListStep from './substeps/ConfirmCustomListStep';
import MappingStep from './substeps/MappingStep';
import TransactionFieldIDStep from './substeps/TransactionFieldIDStep';

type NetSuiteImportAddCustomListContentProps = {
    policy: OnyxEntry<Policy>;
    draftValues: OnyxEntry<NetSuiteCustomFieldForm>;
};

const formSteps = [ChooseCustomListStep, TransactionFieldIDStep, MappingStep, ConfirmCustomListStep];

function NetSuiteImportAddCustomListContent({policy, draftValues}: NetSuiteImportAddCustomListContentProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);
    const formRef = useRef<FormRef | null>(null);

    const values = useMemo(() => getSubstepValues(draftValues), [draftValues]);
    const startFrom = useMemo(() => getCustomListInitialSubstep(values), [values]);

    const config = policy?.connections?.netsuite?.options?.config;
    const customLists = useMemo(() => config?.syncOptions?.customLists ?? [], [config?.syncOptions]);

    const handleFinishStep = useCallback(() => {
        InteractionManager.runAfterInteractions(() => {
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS));
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
    } = useSubStep<CustomFieldSubStepWithPolicy>({
        bodyContent: formSteps,
        startFrom,
        onFinished: handleFinishStep,
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // Clicking back on the first screen should go back to listing
        if (screenIndex === CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER) {
            FormActions.clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM);
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS));
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

    const updateNetSuiteCustomLists = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM>) => {
            const updatedCustomLists = customLists.concat([
                {
                    listName: formValues[INPUT_IDS.LIST_NAME],
                    internalID: formValues[INPUT_IDS.INTERNAL_ID],
                    transactionFieldID: formValues[INPUT_IDS.TRANSACTION_FIELD_ID],
                    mapping: formValues[INPUT_IDS.MAPPING] ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                },
            ]);
            Connections.updateNetSuiteCustomLists(
                policyID,
                updatedCustomLists,
                customLists,
                `${CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS}_${customLists.length}`,
                CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            );
            FormActions.clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM);
            nextScreen();
        },
        [customLists, nextScreen, policyID],
    );

    return (
        <ConnectionLayout
            displayName={NetSuiteImportAddCustomListContent.displayName}
            headerTitle="workspace.netsuite.import.importCustomFields.customLists.addText"
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
                    startStepIndex={startFrom}
                    stepNames={CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST_STEP_NAMES}
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
                    importCustomField={CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS}
                    netSuiteCustomFieldFormValues={values}
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteImportAddCustomListContent.displayName = 'NetSuiteImportAddCustomListContent';

export default NetSuiteImportAddCustomListContent;
