/**
 * Import settings for the Business Central connection: which of the company's coding is pulled into the workspace as
 * categories, tags and taxes, and whether newly imported categories start out enabled.
 */
import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    clearBusinessCentralErrorField,
    updateBusinessCentralEnableNewCategories,
    updateBusinessCentralFieldMapping,
    updateBusinessCentralSyncItems,
    updateBusinessCentralSyncTaxRates,
} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

function BusinessCentralImportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const businessCentralData = policy?.connections?.businessCentral?.data;
    // Integration-Server saves the connection with this on before the first import, so a connection that has not synced yet reads the same way.
    const enableNewCategories = businessCentralConfig?.enableNewCategories ?? true;
    const syncItems = businessCentralConfig?.coding?.syncItems ?? false;
    const syncTaxRates = businessCentralConfig?.coding?.syncTaxRates ?? false;
    const hasDimensions = !!businessCentralData?.dimensions?.length;
    // A US company has no VAT posting setup that can become a tax rate, so it has no tax row to offer.
    const hasVATPostingSetups = !!businessCentralData?.hasVATPostingSetups;
    const sectionTitleStyle = [styles.textLabel, styles.textStrong, styles.lh16, styles.ph5];

    return (
        <ConnectionLayout
            displayName="BusinessCentralImportPage"
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            shouldBeBlocked
        >
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.importDescription')}</Text>
            <Text style={sectionTitleStyle}>{translate('workspace.common.categories')}</Text>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.accounts')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                title={translate('workspace.businessCentral.items')}
                switchAccessibilityLabel={translate('workspace.businessCentral.items')}
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={syncItems}
                onToggle={() => policyID && updateBusinessCentralSyncItems(policyID, !syncItems, syncItems)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS)}
                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS)}
            />
            <ToggleSettingOptionRow
                title={translate('workspace.businessCentral.enableNewCategories')}
                switchAccessibilityLabel={translate('workspace.businessCentral.enableNewCategories')}
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={enableNewCategories}
                onToggle={() => policyID && updateBusinessCentralEnableNewCategories(policyID, !enableNewCategories, enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
            {hasDimensions && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <Text style={sectionTitleStyle}>{translate('workspace.common.tags')}</Text>
                    {businessCentralData?.dimensions?.map((dimension) => {
                        const mapping = businessCentralConfig?.coding?.fieldMappings?.[dimension.code];
                        const isImported = mapping === CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG;
                        const pendingField = `${CONST.BUSINESS_CENTRAL_CONFIG.FIELD_MAPPING_PREFIX}${dimension.code}` as const;
                        return (
                            <ToggleSettingOptionRow
                                key={dimension.code}
                                title={dimension.name}
                                switchAccessibilityLabel={dimension.name}
                                wrapperStyle={[styles.mv3, styles.mh5]}
                                isActive={isImported}
                                onToggle={() =>
                                    policyID &&
                                    updateBusinessCentralFieldMapping(
                                        policyID,
                                        dimension.code,
                                        isImported ? CONST.BUSINESS_CENTRAL_MAPPING_VALUE.NONE : CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG,
                                        mapping,
                                    )
                                }
                                pendingAction={settingsPendingAction([pendingField], businessCentralConfig?.pendingFields)}
                                errors={getLatestErrorField(businessCentralConfig ?? {}, pendingField)}
                                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, pendingField)}
                            />
                        );
                    })}
                </>
            )}
            {hasVATPostingSetups && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <Text style={sectionTitleStyle}>{translate('workspace.common.taxes')}</Text>
                    <ToggleSettingOptionRow
                        title={translate('workspace.accounting.taxes')}
                        switchAccessibilityLabel={translate('workspace.accounting.taxes')}
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTaxRates}
                        onToggle={() => policyID && updateBusinessCentralSyncTaxRates(policyID, !syncTaxRates, syncTaxRates)}
                        pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES], businessCentralConfig?.pendingFields)}
                        errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES)}
                        onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES)}
                    />
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(BusinessCentralImportPage);
