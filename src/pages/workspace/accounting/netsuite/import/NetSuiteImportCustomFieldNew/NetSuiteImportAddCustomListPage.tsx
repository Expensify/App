import React, {useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {CustomFieldSubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ChooseCustomListStep from './substeps/ChooseCustomListStep';
import ConfirmCustomListStep from './substeps/ConfirmCustomListStep';
import MappingStep from './substeps/MappingStep';
import TransactionFieldIDStep from './substeps/TransactionFieldIDStep';

const formSteps = [ChooseCustomListStep, TransactionFieldIDStep, MappingStep, ConfirmCustomListStep];

function NetSuiteImportAddCustomListPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

    const submit = () => {
        // API call and fetch all form values
        FormActions.clearDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_FIELD_ADD_FORM);
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS));
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
            Navigation.goBack();
            return;
        }
        ref.current?.movePrevious();
        prevScreen();
    };

    const handleNextScreen = () => {
        ref.current?.moveNext();
        nextScreen();
    };

    return (
        <ConnectionLayout
            displayName={NetSuiteImportAddCustomListPage.displayName}
            headerTitle="workspace.netsuite.import.importCustomFields.customLists.addText"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={handleBackButtonPress}
            shouldIncludeSafeAreaPaddingBottom
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={0}
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
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteImportAddCustomListPage.displayName = 'NetSuiteImportCustomFieldNewPage';

export default withPolicyConnections(NetSuiteImportAddCustomListPage);
