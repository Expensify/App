import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFinancialForceErrorField, updateFinancialForceSyncMilestones, updateFinancialForceSyncTax} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import {CERTINIA_DIMENSION_PARAMS, getDimensionLabel, getDisplayTypeLabel, getParentTagMappingLabel} from '@pages/workspace/accounting/certinia/utils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

function CertiniaImportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id;
    const config = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]?.config;
    const coding = config?.coding;
    const hasPSA = !!config?.hasPSA;

    return (
        <ConnectionLayout
            displayName="CertiniaImportPage"
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
        >
            {hasPSA ? (
                <>
                    <ToggleSettingOptionRow
                        wrapperStyle={[styles.mv3, styles.ph5]}
                        title={translate('workspace.certinia.import.expenseTypeGlaMappings')}
                        subtitle={translate('workspace.certinia.import.expenseTypeGlaMappingsDescription')}
                        shouldPlaceSubtitleBelowSwitch
                        isActive
                        disabled
                        switchAccessibilityLabel={translate('workspace.certinia.import.expenseTypeGlaMappings')}
                        onToggle={() => {}}
                    />
                    <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.PARENT_TAG_MAPPING], config?.pendingFields)}>
                        <MenuItemField
                            name={translate('workspace.certinia.import.tagsMappedTo')}
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_TAGS_MAPPING.getRoute(policyID));
                            }}
                            value={getParentTagMappingLabel(coding?.parentTagMapping, translate)}
                        >
                            {areSettingsInErrorFields([CONST.CERTINIA_CONFIG.PARENT_TAG_MAPPING], config?.errorFields) && (
                                <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                            )}
                        </MenuItemField>
                    </OfflineWithFeedback>
                    <ToggleSettingOptionRow
                        wrapperStyle={[styles.mv3, styles.ph5]}
                        title={translate('workspace.certinia.import.milestones')}
                        subtitle={translate('workspace.certinia.import.milestonesDescription')}
                        shouldPlaceSubtitleBelowSwitch
                        isActive={!!coding?.syncMilestones}
                        switchAccessibilityLabel={translate('workspace.certinia.import.milestones')}
                        onToggle={(isEnabled: boolean) => {
                            if (!policyID) {
                                return;
                            }
                            updateFinancialForceSyncMilestones(policyID, isEnabled, coding?.syncMilestones);
                        }}
                        pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.SYNC_MILESTONES], config?.pendingFields)}
                        errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.SYNC_MILESTONES)}
                        onCloseError={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.SYNC_MILESTONES)}
                    />
                </>
            ) : (
                <>
                    <ToggleSettingOptionRow
                        wrapperStyle={[styles.mv3, styles.ph5]}
                        title={translate('workspace.certinia.import.chartOfAccounts')}
                        subtitle={translate('workspace.certinia.import.chartOfAccountsDescription')}
                        shouldPlaceSubtitleBelowSwitch
                        isActive
                        disabled
                        switchAccessibilityLabel={translate('workspace.certinia.import.chartOfAccounts')}
                        onToggle={() => {}}
                    />
                    {CERTINIA_DIMENSION_PARAMS.map((dimension) => (
                        <OfflineWithFeedback
                            key={dimension}
                            pendingAction={settingsPendingAction([dimension], config?.pendingFields)}
                        >
                            <MenuItemField
                                name={getDimensionLabel(dimension, translate)}
                                onPress={() => {
                                    if (!policyID) {
                                        return;
                                    }
                                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_DIMENSION_MAPPING.getRoute(policyID, dimension));
                                }}
                                value={getDisplayTypeLabel(coding?.[dimension], translate)}
                            >
                                {areSettingsInErrorFields([dimension], config?.errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                            </MenuItemField>
                        </OfflineWithFeedback>
                    ))}
                    <ToggleSettingOptionRow
                        wrapperStyle={[styles.mv3, styles.ph5]}
                        title={translate('common.tax')}
                        isActive={!!coding?.syncTax}
                        switchAccessibilityLabel={translate('common.tax')}
                        onToggle={(isEnabled: boolean) => {
                            if (!policyID) {
                                return;
                            }
                            updateFinancialForceSyncTax(policyID, isEnabled, coding?.syncTax);
                        }}
                        pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.SYNC_TAX], config?.pendingFields)}
                        errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.SYNC_TAX)}
                        onCloseError={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.SYNC_TAX)}
                    />
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(CertiniaImportPage);
