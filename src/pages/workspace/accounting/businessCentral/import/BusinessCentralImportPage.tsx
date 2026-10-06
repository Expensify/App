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

import React from 'react';
import {View} from 'react-native';

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
    const tagRows = [
        {
            id: CONST.BUSINESS_CENTRAL_FIELD_MAPPING.PROJECTS,
            name: translate('workspace.businessCentral.projects'),
            isLocked: !hasPurchaseInvoiceExport,
            isCustomerMapping: true,
        },
        {
            id: CONST.BUSINESS_CENTRAL_FIELD_MAPPING.CUSTOMERS,
            name: translate('workspace.businessCentral.customers'),
            isLocked: !hasPurchaseInvoiceExport,
            isCustomerMapping: true,
        },
        ...(businessCentralData?.dimensions ?? []).map((dimension) => ({id: dimension.id, name: dimension.name, isLocked: false, isCustomerMapping: false})),
    ];

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
                    {tagRows.map((tagRow) => {
                        const customerMappingName =
                            tagRow.id === CONST.BUSINESS_CENTRAL_FIELD_MAPPING.CUSTOMERS ? CONST.BUSINESS_CENTRAL_FIELD_MAPPING.CUSTOMERS : CONST.BUSINESS_CENTRAL_FIELD_MAPPING.PROJECTS;
                        const mapping = tagRow.isCustomerMapping
                            ? businessCentralConfig?.coding?.customerMappings?.[customerMappingName]
                            : businessCentralConfig?.coding?.fieldMappings?.[tagRow.id];
                        const isImported = mapping === CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG;
                        const pendingField = tagRow.isCustomerMapping ? customerMappingName : `${CONST.BUSINESS_CENTRAL_CONFIG.FIELD_MAPPING_PREFIX}${tagRow.id}`;
                        return (
                            <ToggleSettingOptionRow
                                key={tagRow.id}
                                title={tagRow.name}
                                switchAccessibilityLabel={tagRow.name}
                                shouldPlaceSubtitleBelowSwitch
                                wrapperStyle={toggleRowStyle}
                                isActive={isImported}
                                onToggle={() => {
                                    if (!policyID) {
                                        return;
                                    }

                                    const updatedMapping = isImported ? CONST.BUSINESS_CENTRAL_MAPPING_VALUE.NONE : CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG;
                                    if (tagRow.isCustomerMapping) {
                                        updateBusinessCentralCustomerMapping(policyID, customerMappingName, updatedMapping, mapping);
                                        return;
                                    }

                                    updateBusinessCentralFieldMapping(policyID, tagRow.id, updatedMapping, mapping);
                                }}
                                disabled={tagRow.isLocked}
                                showLockIcon={tagRow.isLocked}
                                disabledAction={tagRow.isLocked ? showPurchaseInvoiceRequiredModal : undefined}
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
