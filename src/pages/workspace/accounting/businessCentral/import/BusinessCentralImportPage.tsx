/**
 * Import settings for the Business Central connection: which of the company's coding is pulled into the workspace as
 * categories, tags and taxes, and whether newly imported categories start out enabled.
 */
import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    clearBusinessCentralErrorField,
    updateBusinessCentralEnableNewCategories,
    updateBusinessCentralCustomerMapping,
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

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type CustomerMappingName = ValueOf<typeof CONST.BUSINESS_CENTRAL_FIELD_MAPPING>;

type CustomerMappingToggleRowProps = {
    isLocked: boolean;
    label: string;
    mappingName: CustomerMappingName;
    onLockedPress: () => void;
    policy: WithPolicyConnectionsProps['policy'];
    policyID: string | undefined;
};

function CustomerMappingToggleRow({isLocked, label, mappingName, onLockedPress, policy, policyID}: CustomerMappingToggleRowProps) {
    const styles = useThemeStyles();
    const config = policy?.connections?.businessCentral?.config;
    const mapping = config?.coding?.customerMappings?.[mappingName];
    const isImported = mapping === CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG;

    return (
        <ToggleSettingOptionRow
            title={label}
            switchAccessibilityLabel={label}
            shouldPlaceSubtitleBelowSwitch
            wrapperStyle={[styles.mv3, styles.mh5]}
            isActive={isImported}
            onToggle={() =>
                policyID &&
                updateBusinessCentralCustomerMapping(policyID, mappingName, isImported ? CONST.BUSINESS_CENTRAL_MAPPING_VALUE.NONE : CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG, mapping)
            }
            disabled={isLocked}
            showLockIcon={isLocked}
            disabledAction={isLocked ? onLockedPress : undefined}
            pendingAction={settingsPendingAction([mappingName], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, mappingName)}
            onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, mappingName)}
        />
    );
}

function BusinessCentralImportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const businessCentralData = policy?.connections?.businessCentral?.data;

    // Integration-Server saves the connection with this on before the first import, so a connection that has not synced yet reads the same way.
    const enableNewCategories = businessCentralConfig?.enableNewCategories ?? true;
    const syncItems = businessCentralConfig?.coding?.syncItems ?? false;
    const syncTaxRates = businessCentralConfig?.coding?.syncTaxRates ?? false;
    const hasSyncedTagSources = businessCentralData?.dimensions !== undefined;
    const exportConfig = businessCentralConfig?.export;
    const reimbursableExportDestination = exportConfig?.reimbursable ?? CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.JOURNAL_ENTRY;
    const nonReimbursableExportDestination = exportConfig?.nonReimbursable ?? CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.PURCHASE_INVOICE;
    const hasPurchaseInvoiceExport =
        reimbursableExportDestination === CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.PURCHASE_INVOICE ||
        nonReimbursableExportDestination === CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.PURCHASE_INVOICE;
    const showPurchaseInvoiceRequiredModal = () => {
        showConfirmModal({
            title: translate('workspace.businessCentral.projectsAndCustomersCannotBeEnabled'),
            prompt: translate('workspace.businessCentral.projectsAndCustomersCannotBeEnabledDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };
    // A US company has no VAT posting setup that can become a tax rate, so it has no tax row to offer.
    const hasVATPostingSetups = !!businessCentralData?.hasVATPostingSetups;
    const sectionTitleStyle = [styles.textLabel, styles.textStrong, styles.lh16, styles.ph5, styles.pt4, styles.pb2];
    const toggleRowStyle = [styles.mv3, styles.mh5];

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
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.accounts')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                subtitle={translate('workspace.businessCentral.accountsDescription')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={toggleRowStyle}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                title={translate('workspace.businessCentral.items')}
                switchAccessibilityLabel={translate('workspace.businessCentral.items')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={toggleRowStyle}
                isActive={syncItems}
                onToggle={() => policyID && updateBusinessCentralSyncItems(policyID, !syncItems, syncItems)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS)}
                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS)}
            />
            <ToggleSettingOptionRow
                title={translate('workspace.businessCentral.enableNewCategories')}
                switchAccessibilityLabel={translate('workspace.businessCentral.enableNewCategories')}
                subtitle={translate('workspace.businessCentral.enableNewCategoriesDescription')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={toggleRowStyle}
                isActive={enableNewCategories}
                onToggle={() => policyID && updateBusinessCentralEnableNewCategories(policyID, !enableNewCategories, enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
            {hasSyncedTagSources && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <View style={[styles.mv3, styles.mh5]}>
                        <Text>{translate('workspace.businessCentral.dimensionsImportAsTags')}</Text>
                    </View>
                    <CustomerMappingToggleRow
                        isLocked={!hasPurchaseInvoiceExport}
                        label={translate('workspace.businessCentral.projects')}
                        mappingName={CONST.BUSINESS_CENTRAL_FIELD_MAPPING.PROJECTS}
                        onLockedPress={showPurchaseInvoiceRequiredModal}
                        policy={policy}
                        policyID={policyID}
                    />
                    <CustomerMappingToggleRow
                        isLocked={!hasPurchaseInvoiceExport}
                        label={translate('workspace.businessCentral.customers')}
                        mappingName={CONST.BUSINESS_CENTRAL_FIELD_MAPPING.CUSTOMERS}
                        onLockedPress={showPurchaseInvoiceRequiredModal}
                        policy={policy}
                        policyID={policyID}
                    />
                    {(businessCentralData?.dimensions ?? []).map((dimension) => {
                        const mapping = businessCentralConfig?.coding?.fieldMappings?.[dimension.id];
                        const isImported = mapping === CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG;
                        const pendingField = `${CONST.BUSINESS_CENTRAL_CONFIG.FIELD_MAPPING_PREFIX}${dimension.id}`;
                        return (
                            <ToggleSettingOptionRow
                                key={dimension.id}
                                title={dimension.name}
                                switchAccessibilityLabel={dimension.name}
                                shouldPlaceSubtitleBelowSwitch
                                wrapperStyle={toggleRowStyle}
                                isActive={isImported}
                                onToggle={() =>
                                    policyID &&
                                    updateBusinessCentralFieldMapping(
                                        policyID,
                                        dimension.id,
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
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={toggleRowStyle}
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
