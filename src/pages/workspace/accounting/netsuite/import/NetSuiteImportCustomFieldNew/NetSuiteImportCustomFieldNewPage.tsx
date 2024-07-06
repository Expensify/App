import React, {useRef} from 'react';
import type {ComponentType, ForwardedRef} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import AddCustomRecordStep from './substeps/AddCustomRecordStep';
import type {SubStepWithPolicy} from './substeps/AddCustomRecordStep';

const formSteps = Array<ComponentType<SubStepWithPolicy>>(4).fill(AddCustomRecordStep);

type ImportCustomFieldsKeys = ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;
type NetSuiteImportCustomFieldNewPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            importCustomField: ImportCustomFieldsKeys;
        };
    };
};

function NetSuiteImportCustomFieldNewPage({
    policy,
    route: {
        params: {importCustomField},
    },
}: NetSuiteImportCustomFieldNewPageProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

    const submit = () => {
        // API call and fetch all form values
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, importCustomField));
    };

    const {componentToRender: SubStep, isEditing, nextScreen, prevScreen, screenIndex, moveTo} = useSubStep<SubStepWithPolicy>({bodyContent: formSteps, startFrom: 0, onFinished: submit});

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
            displayName={NetSuiteImportCustomFieldNewPage.displayName}
            headerTitle={`workspace.netsuite.import.importCustomFields.${importCustomField}.addText`}
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
                    stepNames={CONST.NETSUITE_CONFIG.TOKEN_INPUT_STEP_NAMES}
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

NetSuiteImportCustomFieldNewPage.displayName = 'NetSuiteImportCustomFieldNewPage';

export default withPolicyConnections(NetSuiteImportCustomFieldNewPage);
