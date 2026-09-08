import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearCampfireErrorField, updateCampfireEnableNewCategories, updateCampfireFieldMapping, updateCampfireSyncTaxRates} from '@libs/actions/connections/Campfire';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

function CampfireImportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const campfireConfig = policy?.connections?.campfire?.config;
    const campfireData = policy?.connections?.campfire?.data;
    const enableNewCategories = campfireConfig?.enableNewCategories ?? false;
    const hasTaxRates = !!campfireData?.taxRates?.length;
    const syncTaxRates = campfireConfig?.coding?.syncTaxRates ?? false;

    return (
        <ConnectionLayout
            displayName="CampfireImportPage"
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.campfire.importDescription')}</Text>
            </View>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.accounts')}
                subtitle={translate('workspace.campfire.accountTypesDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                title={translate('workspace.campfire.enableNewAccountsTitle')}
                subtitle={translate('workspace.campfire.enableNewAccountsDescription')}
                switchAccessibilityLabel={translate('workspace.campfire.enableNewAccountsTitle')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={enableNewCategories}
                onToggle={() => policyID && updateCampfireEnableNewCategories(policyID, !enableNewCategories, enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.ENABLE_NEW_CATEGORIES], campfireConfig?.pendingFields)}
                errors={getLatestErrorField(campfireConfig ?? {}, CONST.CAMPFIRE_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <View style={[styles.mv3, styles.mh5]}>
                <Text>{translate('workspace.campfire.dimensionsImport')}</Text>
            </View>
            {campfireData?.fields?.map((field) => {
                const mapping = campfireConfig?.coding?.fieldMappings?.[field.id];
                const isImported = mapping === CONST.CAMPFIRE_MAPPING_VALUE.TAG;
                return (
                    <ToggleSettingOptionRow
                        key={field.id}
                        title={field.name}
                        switchAccessibilityLabel={field.name}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={isImported}
                        onToggle={() =>
                            policyID && updateCampfireFieldMapping(policyID, field.id, isImported ? CONST.CAMPFIRE_MAPPING_VALUE.NONE : CONST.CAMPFIRE_MAPPING_VALUE.TAG, mapping)
                        }
                        pendingAction={settingsPendingAction([`${CONST.CAMPFIRE_CONFIG.FIELD_MAPPING_PREFIX}${field.id}`], campfireConfig?.pendingFields)}
                        errors={getLatestErrorField(campfireConfig ?? {}, `${CONST.CAMPFIRE_CONFIG.FIELD_MAPPING_PREFIX}${field.id}`)}
                        onCloseError={() => policyID && clearCampfireErrorField(policyID, `${CONST.CAMPFIRE_CONFIG.FIELD_MAPPING_PREFIX}${field.id}`)}
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
                        onToggle={() => policyID && updateCampfireSyncTaxRates(policyID, !syncTaxRates, syncTaxRates)}
                        pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.SYNC_TAX_RATES], campfireConfig?.pendingFields)}
                        errors={getLatestErrorField(campfireConfig ?? {}, CONST.CAMPFIRE_CONFIG.SYNC_TAX_RATES)}
                        onCloseError={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.SYNC_TAX_RATES)}
                    />
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(CampfireImportPage);
