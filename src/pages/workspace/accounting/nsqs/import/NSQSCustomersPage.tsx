import React, {useCallback} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNSQSCustomersMapping} from '@libs/actions/connections/NSQS';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearNSQSErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NSQSCustomersPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const importType = nsqsConfig?.syncOptions.mapping.customers ?? CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const isImportEnabled = importType !== CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

    const toggleImport = useCallback(() => {
        if (!policyID) {
            return;
        }

        const mapping = isImportEnabled ? CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT : CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.TAG;
        updateNSQSCustomersMapping(policyID, mapping, importType);
    }, [policyID, importType, isImportEnabled]);

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NSQSCustomersPage.displayName}
            headerTitle="workspace.nsqs.import.importFields.customers.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5, styles.gap6]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onBackButtonPress={policyID ? () => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT.getRoute(policyID)) : undefined}
        >
            <RenderHTML html={`<comment>${Parser.replace(translate(`workspace.nsqs.import.importFields.customers.subtitle`))}</comment>`} />
            <View>
                <ToggleSettingOptionRow
                    title={translate('workspace.accounting.import')}
                    switchAccessibilityLabel={translate('workspace.accounting.import')}
                    isActive={isImportEnabled}
                    onToggle={toggleImport}
                    pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS], nsqsConfig?.pendingFields)}
                    errors={getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS)}
                    onCloseError={policyID ? () => clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS) : undefined}
                />
                {isImportEnabled && (
                    <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS], nsqsConfig?.pendingFields)}>
                        <MenuItemWithTopDescription
                            title={translate(`workspace.nsqs.import.importTypes.${importType}.label`)}
                            description={translate(`workspace.common.displayedAs`)}
                            wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                            shouldShowRightIcon
                            onPress={policyID ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_CUSTOMERS_DISPLAYED_AS.getRoute(policyID)) : undefined}
                            brickRoadIndicator={
                                areSettingsInErrorFields([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                            }
                        />
                    </OfflineWithFeedback>
                )}
            </View>
        </ConnectionLayout>
    );
}

NSQSCustomersPage.displayName = 'NSQSCustomersPage';

export default withPolicyConnections(NSQSCustomersPage);
