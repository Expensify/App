import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteSyncTaxConfiguration} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import {areSettingsInErrorFields, canUseTaxNetSuite, settingsPendingAction} from '@libs/PolicyUtils';
import {getImportCustomFieldsSettings} from '@pages/workspace/accounting/netsuite/utils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteImportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {canUseNetSuiteUSATax} = usePermissions();

    const policyID = policy?.id;
    const config = policy?.connections?.netsuite?.options?.config;
    const {subsidiaryList} = policy?.connections?.netsuite?.options?.data ?? {};
    const selectedSubsidiary = useMemo(() => (subsidiaryList ?? []).find((subsidiary) => subsidiary.internalID === config?.subsidiaryID), [subsidiaryList, config?.subsidiaryID]);

    return (
        <ConnectionLayout
            displayName={NetSuiteImportPage.displayName}
            headerTitle="workspace.accounting.import"
            headerSubtitle={config?.subsidiary ?? ''}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        >
            <ToggleSettingOptionRow
                wrapperStyle={[styles.mv3, styles.ph5]}
                title={translate('workspace.netsuite.import.expenseCategories')}
                subtitle={translate('workspace.netsuite.import.expenseCategoriesDescription')}
                shouldPlaceSubtitleBelowSwitch
                isActive
                disabled
                switchAccessibilityLabel={translate('workspace.netsuite.import.expenseCategories')}
                onToggle={() => {}}
            />
            {CONST.NETSUITE_CONFIG.IMPORT_FIELDS.map((importField) => (
                <OfflineWithFeedback
                    key={importField}
                    pendingAction={settingsPendingAction([importField], config?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        description={translate(`workspace.netsuite.import.importFields.${importField}.title`)}
                        title={translate(`workspace.accounting.importTypes.${config?.syncOptions?.mapping?.[importField] ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT}`)}
                        shouldShowRightIcon
                        onPress={() => {
                            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_MAPPING.getRoute(policyID, importField));
                        }}
                        brickRoadIndicator={areSettingsInErrorFields([importField], config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}
            <OfflineWithFeedback
                pendingAction={settingsPendingAction(
                    [
                        CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS,
                        CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS,
                        CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS,
                    ],
                    config?.pendingFields,
                )}
            >
                <MenuItemWithTopDescription
                    description={translate(`workspace.netsuite.import.customersOrJobs.title`)}
                    title={PolicyUtils.getCustomersOrJobsLabelNetSuite(policy, translate)}
                    shouldShowRightIcon
                    numberOfLinesTitle={2}
                    onPress={() => {
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS.getRoute(policyID));
                    }}
                    brickRoadIndicator={
                        areSettingsInErrorFields(
                            [
                                CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS,
                                CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS,
                                CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS,
                            ],
                            config?.errorFields,
                        )
                            ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                            : undefined
                    }
                />
            </OfflineWithFeedback>
            {canUseTaxNetSuite(canUseNetSuiteUSATax, selectedSubsidiary?.country) && (
                <ToggleSettingOptionRow
                    wrapperStyle={[styles.mv3, styles.ph5]}
                    title={translate('common.tax')}
                    subtitle={translate('workspace.netsuite.import.importTaxDescription')}
                    shouldPlaceSubtitleBelowSwitch
                    isActive={config?.syncOptions?.syncTax ?? false}
                    switchAccessibilityLabel={translate('common.tax')}
                    onToggle={(isEnabled: boolean) => {
                        updateNetSuiteSyncTaxConfiguration(policyID, isEnabled);
                    }}
                    pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX], config?.pendingFields)}
                    errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX)}
                    onCloseError={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX)}
                />
            )}
            {Object.values(CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS).map((importField) => {
                const settings = getImportCustomFieldsSettings(importField, config);
                return (
                    <OfflineWithFeedback
                        key={importField}
                        pendingAction={settingsPendingAction(settings, config?.pendingFields)}
                        shouldDisableStrikeThrough
                    >
                        <MenuItemWithTopDescription
                            title={PolicyUtils.getNetSuiteImportCustomFieldLabel(policy, importField, translate)}
                            description={translate(`workspace.netsuite.import.importCustomFields.${importField}.title`)}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, importField))}
                            brickRoadIndicator={areSettingsInErrorFields(settings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                    </OfflineWithFeedback>
                );
            })}
        </ConnectionLayout>
    );
}

NetSuiteImportPage.displayName = 'NetSuiteImportPage';
export default withPolicyConnections(NetSuiteImportPage);
