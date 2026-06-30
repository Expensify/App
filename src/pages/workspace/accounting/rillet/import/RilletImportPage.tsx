import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearRilletErrorField, updateRilletEnableNewCategories, updateRilletFieldMapping, updateRilletSyncTaxRates} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';

function RilletImportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;

    return (
        <ConnectionLayout
            displayName="RilletImportPage"
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
        >
            <View style={[styles.mv3, styles.mh5]}>
                <Text>{translate('workspace.rillet.importDescription')}</Text>
            </View>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.accounts')}
                subtitle={translate('workspace.rillet.accountTypesDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                title={translate('workspace.rillet.enableNewAccountsTitle')}
                subtitle={translate('workspace.rillet.enableNewAccountsDescription')}
                switchAccessibilityLabel={translate('workspace.rillet.enableNewAccountsTitle')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={rilletConfig?.enableNewCategories ?? false}
                onToggle={() => policyID && updateRilletEnableNewCategories(policyID, !rilletConfig?.enableNewCategories, rilletConfig?.enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES], rilletConfig?.pendingFields)}
                errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <View style={[styles.mv3, styles.mh5]}>
                <Text>{translate('workspace.rillet.dimensionsImport')}</Text>
            </View>
            {rilletData?.fields?.map((field) => (
                <ToggleSettingOptionRow
                    key={field.id}
                    title={field.name}
                    switchAccessibilityLabel={field.name}
                    shouldPlaceSubtitleBelowSwitch
                    wrapperStyle={[styles.mv3, styles.mh5]}
                    isActive={rilletConfig?.coding?.fieldMappings?.[field.id] === CONST.RILLET_MAPPING_VALUE.TAG}
                    onToggle={() =>
                        policyID &&
                        updateRilletFieldMapping(
                            policyID,
                            field.id,
                            rilletConfig?.coding?.fieldMappings?.[field.id] === CONST.RILLET_MAPPING_VALUE.TAG ? CONST.RILLET_MAPPING_VALUE.NONE : CONST.RILLET_MAPPING_VALUE.TAG,
                            rilletConfig?.coding?.fieldMappings?.[field.id],
                        )
                    }
                    pendingAction={settingsPendingAction([`${CONST.RILLET_CONFIG.FIELD_MAPPING_PREFIX}${field.id}`], rilletConfig?.pendingFields)}
                    errors={getLatestErrorField(rilletConfig ?? {}, `${CONST.RILLET_CONFIG.FIELD_MAPPING_PREFIX}${field.id}`)}
                    onCloseError={() => policyID && clearRilletErrorField(policyID, `${CONST.RILLET_CONFIG.FIELD_MAPPING_PREFIX}${field.id}`)}
                />
            ))}
            {!!rilletData?.taxRates?.length && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.taxes.taxRates')}
                        switchAccessibilityLabel={translate('workspace.taxes.taxRates')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={rilletConfig?.coding?.syncTaxRates ?? false}
                        onToggle={() => policyID && updateRilletSyncTaxRates(policyID, !rilletConfig?.coding?.syncTaxRates, rilletConfig?.coding?.syncTaxRates)}
                        pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.SYNC_TAX_RATES], rilletConfig?.pendingFields)}
                        errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.SYNC_TAX_RATES)}
                        onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.SYNC_TAX_RATES)}
                    />
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(RilletImportPage);
