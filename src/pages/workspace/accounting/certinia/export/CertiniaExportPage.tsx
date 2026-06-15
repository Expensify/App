import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import {getCertiniaExportStatusValue} from '@pages/workspace/accounting/certinia/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

type ExportRow = {
    description: string;
    title?: string;
    helperText?: string;
    onPress?: () => void;
    interactive?: boolean;
    subscribedSettings: string[];
};

function CertiniaExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const policyOwner = policy?.owner ?? '';
    const {config, data} = policy?.connections?.financialforce ?? {};
    const exportConfig = config?.export;
    const exportPath = policyID ? `${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_EXPORT.path}` : undefined;
    const selectedVendor = data?.vendors?.find((vendor) => vendor.id === exportConfig?.vendorAccount);
    const exportStatus = exportConfig?.exportStatus;
    const normalizedExportStatus = getCertiniaExportStatusValue(exportStatus);
    const exportDate = exportConfig?.exportDate;

    const rows: ExportRow[] = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            title: exportConfig?.exporter ?? policyOwner,
            onPress: !exportPath ? undefined : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_PREFERRED_EXPORTER.path, exportPath)),
            subscribedSettings: [CONST.CERTINIA_CONFIG.EXPORTER],
        },
        {
            description: translate('workspace.certinia.exportStatus.label'),
            title: normalizedExportStatus ? translate(`workspace.certinia.exportStatus.values.${normalizedExportStatus}`) : exportStatus,
            onPress: !exportPath ? undefined : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_EXPORT_STATUS.path, exportPath)),
            subscribedSettings: [CONST.CERTINIA_CONFIG.EXPORT_STATUS],
        },
        {
            description: translate('workspace.certinia.exportDate.label'),
            title: exportDate ? translate(`workspace.certinia.exportDate.values.${exportDate}`) : exportConfig?.exportDate,
            onPress: !exportPath ? undefined : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_EXPORT_DATE.path, exportPath)),
            subscribedSettings: [CONST.CERTINIA_CONFIG.EXPORT_DATE],
        },
        {
            description: translate('workspace.certinia.exportReimbursable.label'),
            title: translate('workspace.certinia.payableInvoices'),
            helperText: translate('workspace.certinia.exportReimbursable.helperText'),
            interactive: false,
            subscribedSettings: [CONST.CERTINIA_CONFIG.REIMBURSABLE],
        },
        {
            description: translate('workspace.certinia.exportNonReimbursable.label'),
            title: translate('workspace.certinia.payableInvoices'),
            interactive: false,
            subscribedSettings: [CONST.CERTINIA_CONFIG.NON_REIMBURSABLE],
        },
        {
            description: translate('workspace.accounting.defaultVendor'),
            title: selectedVendor?.name,
            onPress: !exportPath ? undefined : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_DEFAULT_VENDOR.path, exportPath)),
            subscribedSettings: [CONST.CERTINIA_CONFIG.VENDOR_ACCOUNT],
        },
    ];

    return (
        <ConnectionLayout
            displayName="CertiniaExportPage"
            headerTitle="workspace.accounting.export"
            title="workspace.certinia.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            onBackButtonPress={() => Navigation.goBack(policyID ? ROUTES.POLICY_ACCOUNTING.getRoute(policyID) : undefined)}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
        >
            {rows.map((row) => {
                const pendingAction = settingsPendingAction(row.subscribedSettings, config?.pendingFields);
                const brickRoadIndicator = areSettingsInErrorFields(row.subscribedSettings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
                return (
                    <OfflineWithFeedback
                        key={row.description}
                        pendingAction={pendingAction}
                    >
                        <MenuItemWithTopDescription
                            title={row.title}
                            description={row.description}
                            helperText={row.helperText}
                            shouldShowRightIcon={row.interactive !== false}
                            onPress={row.onPress}
                            interactive={row.interactive}
                            brickRoadIndicator={brickRoadIndicator}
                        />
                    </OfflineWithFeedback>
                );
            })}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(CertiniaExportPage);
