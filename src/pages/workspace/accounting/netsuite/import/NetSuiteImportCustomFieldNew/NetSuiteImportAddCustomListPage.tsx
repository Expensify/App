import React, {useCallback, useMemo, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {InteractionManager, View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
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
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import ChooseCustomListStep from './substeps/ChooseCustomListStep';
import ConfirmCustomListStep from './substeps/ConfirmCustomListStep';
import MappingStep from './substeps/MappingStep';
import TransactionFieldIDStep from './substeps/TransactionFieldIDStep';

const formSteps = [ChooseCustomListStep, TransactionFieldIDStep, MappingStep, ConfirmCustomListStep];

function NetSuiteImportAddCustomListPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

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
        startFrom: CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER,
        onFinished: handleFinishStep,
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // Clicking back on the first screen should go back to listing
        if (screenIndex === CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER) {
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS));
            return;
        }
        ref.current?.movePrevious();
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

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM> = {};
            switch (screenIndex) {
                case CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER:
                    return ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.LIST_NAME]);
                case CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.TRANSACTION_FIELD_ID:
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.TRANSACTION_FIELD_ID])) {
                        const fieldLabel = translate(`workspace.netsuite.import.importCustomFields.customLists.fields.transactionFieldID`);
                        errors[INPUT_IDS.TRANSACTION_FIELD_ID] = translate('workspace.netsuite.import.importCustomFields.requiredFieldError', fieldLabel);
                    } else if (customLists.find((customList) => customList.transactionFieldID.toLowerCase() === values[INPUT_IDS.TRANSACTION_FIELD_ID].toLowerCase())) {
                        errors[INPUT_IDS.TRANSACTION_FIELD_ID] = translate('workspace.netsuite.import.importCustomFields.customLists.errors.uniqueTransactionFieldIDError');
                    }
                    return errors;
                case CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.MAPPING:
                    return ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.MAPPING]);
                default:
                    return errors;
            }
        },
        [customLists, screenIndex, translate],
    );

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
            nextScreen();
        },
        [customLists, nextScreen, policyID],
    );

    const selectionListForm = [CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.MAPPING as number].includes(screenIndex);
    const submitFlexAllowed = [
        CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER as number,
        CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.TRANSACTION_FIELD_ID as number,
    ].includes(screenIndex);

    return (
        <ConnectionLayout
            displayName={NetSuiteImportAddCustomListPage.displayName}
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
                    startStepIndex={CONST.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER}
                    stepNames={CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST_STEP_NAMES}
                />
            </View>
            <View style={[styles.flexGrow1, styles.mt3]}>
                <FormProvider
                    formID={ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM}
                    submitButtonText={screenIndex === formSteps.length - 1 ? translate('common.confirm') : translate('common.next')}
                    onSubmit={screenIndex === formSteps.length - 1 ? updateNetSuiteCustomLists : handleNextScreen}
                    validate={validate}
                    style={[styles.mt3, styles.flexGrow1]}
                    submitButtonStyles={[styles.ph5, styles.mb0]}
                    shouldUseScrollView={!selectionListForm}
                    enabledWhenOffline
                    isSubmitDisabled={!!config?.pendingFields?.customLists}
                    submitFlexEnabled={submitFlexAllowed}
                >
                    <SubStep
                        isEditing={isEditing}
                        onNext={handleNextScreen}
                        onMove={moveTo}
                        screenIndex={screenIndex}
                        policyID={policyID}
                        policy={policy}
                        importCustomField={CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS}
                    />
                </FormProvider>
            </View>
        </ConnectionLayout>
    );
}

NetSuiteImportAddCustomListPage.displayName = 'NetSuiteImportAddCustomListPage';

export default withPolicyConnections(NetSuiteImportAddCustomListPage);
