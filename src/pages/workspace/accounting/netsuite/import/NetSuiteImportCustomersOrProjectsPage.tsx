import React, {useCallback} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCrossSubsidiaryCustomersConfiguration, updateNetSuiteImportMapping} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type ImportField = 'jobs' | 'customers';

function NetSuiteImportCustomersOrProjectsPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const config = policy?.connections?.netsuite?.options?.config;
    const importMappings = config?.syncOptions?.mapping;
    const importCustomer = importMappings?.customers ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const importJobs = importMappings?.jobs ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const importedValue = importMappings?.customers !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? importCustomer : importJobs;

    const updateMapping = useCallback(
        (importField: ImportField, isEnabled: boolean) => {
            let newValue;
            if (!isEnabled) {
                // if the import is off, then we send default as the value for mapping
                newValue = CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
            } else {
                // when we enable any field, and if the other one already has a value set, we should set that,
                const otherFieldValue = importField === CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS ? importCustomer : importJobs;
                if (otherFieldValue === CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
                    // fallback to Tag
                    newValue = CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG;
                } else {
                    newValue = otherFieldValue;
                }
            }
            if (newValue) {
                updateNetSuiteImportMapping(policyID, importField, newValue, config?.syncOptions?.mapping?.[importField] ?? null);
            }
        },
        [config?.syncOptions?.mapping, policyID, importCustomer, importJobs],
    );

    return (
        <ConnectionLayout
            displayName={NetSuiteImportCustomersOrProjectsPage.displayName}
            headerTitle="workspace.netsuite.import.customersOrJobs.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID))}
        >
            <View style={[styles.ph5, styles.flexRow, styles.pb5]}>
                <RenderHTML html={`<comment>${Parser.replace(translate('workspace.netsuite.import.customersOrJobs.subtitle' as TranslationPaths))}</comment>`} />
            </View>

            <ToggleSettingOptionRow
                wrapperStyle={[styles.mv3, styles.ph5]}
                title={translate('workspace.netsuite.import.customersOrJobs.importCustomers')}
                isActive={(config?.syncOptions?.mapping?.customers ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT}
                switchAccessibilityLabel={translate('workspace.netsuite.import.customersOrJobs.importCustomers')}
                onToggle={(isEnabled: boolean) => {
                    updateMapping(CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS, isEnabled);
                }}
                pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS], config?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS)}
                onCloseError={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS)}
            />
            <ToggleSettingOptionRow
                wrapperStyle={[styles.mv3, styles.ph5]}
                title={translate('workspace.netsuite.import.customersOrJobs.importJobs')}
                isActive={(config?.syncOptions?.mapping?.jobs ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT}
                switchAccessibilityLabel={translate('workspace.netsuite.import.customersOrJobs.importJobs')}
                onToggle={(isEnabled: boolean) => {
                    updateMapping(CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS, isEnabled);
                }}
                pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS], config?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS)}
                onCloseError={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS)}
            />
            {importedValue !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT && (
                <ToggleSettingOptionRow
                    wrapperStyle={[styles.mv3, styles.ph5]}
                    title={translate('workspace.netsuite.import.crossSubsidiaryCustomers')}
                    isActive={config?.syncOptions?.crossSubsidiaryCustomers ?? false}
                    switchAccessibilityLabel={translate('workspace.netsuite.import.crossSubsidiaryCustomers')}
                    onToggle={(isEnabled: boolean) => {
                        updateNetSuiteCrossSubsidiaryCustomersConfiguration(policyID, isEnabled);
                    }}
                    pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS], config?.pendingFields)}
                    errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                    onCloseError={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                />
            )}

            {importedValue !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT && (
                <OfflineWithFeedback
                    pendingAction={settingsPendingAction(
                        [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS],
                        config?.pendingFields,
                    )}
                >
                    <MenuItemWithTopDescription
                        description={translate('workspace.common.displayedAs')}
                        title={translate(`workspace.netsuite.import.importTypes.${importedValue}.label`)}
                        shouldShowRightIcon
                        onPress={() => {
                            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT.getRoute(policyID));
                        }}
                        brickRoadIndicator={
                            areSettingsInErrorFields(
                                [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS],
                                config?.errorFields,
                            )
                                ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                : undefined
                        }
                    />
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

NetSuiteImportCustomersOrProjectsPage.displayName = 'NetSuiteImportCustomersOrProjectsPage';

export default withPolicyConnections(NetSuiteImportCustomersOrProjectsPage);
