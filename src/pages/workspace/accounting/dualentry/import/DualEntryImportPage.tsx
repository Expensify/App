import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntryEnableNewCategories, updateDualEntryFieldMapping, updateDualEntrySyncTaxRates} from '@libs/actions/connections/DualEntry';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

function DualEntryImportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const enableNewCategories = dualentryConfig?.enableNewCategories ?? false;
    const hasTaxRates = !!dualentryData?.taxRates?.length;
    const syncTaxRates = dualentryConfig?.coding?.syncTaxRates ?? false;

    return (
        <ConnectionLayout
            displayName="DualEntryImportPage"
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.dualEntry.importDescription')}</Text>
            </View>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.accounts')}
                subtitle={translate('workspace.dualEntry.accountTypesDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                title={translate('workspace.dualEntry.enableNewAccountsTitle')}
                subtitle={translate('workspace.dualEntry.enableNewAccountsDescription')}
                switchAccessibilityLabel={translate('workspace.dualEntry.enableNewAccountsTitle')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={enableNewCategories}
                onToggle={() => policyID && updateDualEntryEnableNewCategories(policyID, !enableNewCategories, enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.ENABLE_NEW_CATEGORIES], dualentryConfig?.pendingFields)}
                errors={getLatestErrorField(dualentryConfig ?? {}, CONST.DUALENTRY_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <View style={[styles.mv3, styles.mh5]}>
                <Text>{translate('workspace.dualEntry.classificationsImport')}</Text>
            </View>
            {dualentryData?.classifications?.map((classification) => {
                const mapping = dualentryConfig?.coding?.fieldMappings?.[classification.id];
                const isImported = mapping === CONST.DUALENTRY_MAPPING_VALUE.TAG;
                return (
                    <ToggleSettingOptionRow
                        key={classification.id}
                        title={classification.name}
                        switchAccessibilityLabel={classification.name}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={isImported}
                        onToggle={() =>
                            policyID && updateDualEntryFieldMapping(policyID, classification.id, isImported ? CONST.DUALENTRY_MAPPING_VALUE.NONE : CONST.DUALENTRY_MAPPING_VALUE.TAG, mapping)
                        }
                        pendingAction={settingsPendingAction([`${CONST.DUALENTRY_CONFIG.FIELD_MAPPING_PREFIX}${classification.id}`], dualentryConfig?.pendingFields)}
                        errors={getLatestErrorField(dualentryConfig ?? {}, `${CONST.DUALENTRY_CONFIG.FIELD_MAPPING_PREFIX}${classification.id}`)}
                        onCloseError={() => policyID && clearDualEntryErrorField(policyID, `${CONST.DUALENTRY_CONFIG.FIELD_MAPPING_PREFIX}${classification.id}`)}
                    />
                );
            })}
            {hasTaxRates && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.taxes.taxRates')}
                        switchAccessibilityLabel={translate('workspace.taxes.taxRates')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTaxRates}
                        onToggle={() => policyID && updateDualEntrySyncTaxRates(policyID, !syncTaxRates, syncTaxRates)}
                        pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.SYNC_TAX_RATES], dualentryConfig?.pendingFields)}
                        errors={getLatestErrorField(dualentryConfig ?? {}, CONST.DUALENTRY_CONFIG.SYNC_TAX_RATES)}
                        onCloseError={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.SYNC_TAX_RATES)}
                    />
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DualEntryImportPage);
