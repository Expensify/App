import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {BusinessCentralExport} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type ExportRow = {
    settingName: keyof BusinessCentralExport;
    label: string;
    value: string | undefined;
    route: Route;
};

function BusinessCentralExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const businessCentralData = policy?.connections?.businessCentral?.data;
    const exportConfig = businessCentralConfig?.export;
    // Integration-Server stores an empty exporter until an admin picks one, and the workspace owner exports in the meantime.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const exporter = exportConfig?.exporter || policy?.owner;
    const exportDate = exportConfig?.exportDate ?? CONST.BUSINESS_CENTRAL_EXPORT_DATE.LAST_EXPENSE;
    const reimbursable = exportConfig?.reimbursable ?? CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.JOURNAL_ENTRY;
    const nonReimbursable = exportConfig?.nonReimbursable ?? CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.PURCHASE_INVOICE;
    const reimbursableAccount = businessCentralData?.bankAccounts?.find((bankAccount) => bankAccount.id === exportConfig?.reimbursableAccount);
    const nonReimbursableAccount = businessCentralData?.bankAccounts?.find((bankAccount) => bankAccount.id === exportConfig?.nonReimbursableAccount);
    const defaultVendor = businessCentralData?.vendors?.find((vendor) => vendor.id === exportConfig?.defaultVendorID);
    const paymentMethod = businessCentralData?.paymentMethods?.find((method) => method.code === exportConfig?.paymentMethodCode);

    if (!policyID) {
        return null;
    }

    const sections: ExportRow[][] = [
        [
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.EXPORTER,
                label: translate('workspace.accounting.preferredExporter'),
                value: exporter,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_PREFERRED_EXPORTER.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_DATE,
                label: translate('workspace.businessCentral.exportDate.label'),
                value: translate(`workspace.businessCentral.exportDate.values.${exportDate}.label`),
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_DATE.getRoute(policyID),
            },
        ],
        [
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE,
                label: translate('workspace.businessCentral.exportReimbursable'),
                value: translate(`workspace.businessCentral.exportDestination.${reimbursable}`),
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE_ACCOUNT,
                label: translate('workspace.businessCentral.reimbursableAccount.label'),
                value: reimbursableAccount ? `${reimbursableAccount.number} ${reimbursableAccount.name}` : undefined,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_REIMBURSABLE_ACCOUNT.getRoute(policyID),
            },
        ],
        [
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE,
                label: translate('workspace.businessCentral.exportNonReimbursable'),
                value: translate(`workspace.businessCentral.exportDestination.${nonReimbursable}`),
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.DEFAULT_VENDOR_ID,
                label: translate('workspace.businessCentral.defaultCompanyCardVendor.label'),
                value: defaultVendor?.name,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_DEFAULT_VENDOR.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                label: translate('workspace.businessCentral.companyCardAccount.label'),
                value: nonReimbursableAccount ? `${nonReimbursableAccount.number} ${nonReimbursableAccount.name}` : undefined,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_COMPANY_CARD_ACCOUNT.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.PAYMENT_METHOD_CODE,
                label: translate('workspace.businessCentral.paymentMethod.label'),
                value: paymentMethod?.displayName,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_PAYMENT_METHOD.getRoute(policyID),
            },
        ],
    ];

    return (
        <ConnectionLayout
            displayName="BusinessCentralExportPage"
            headerTitle="workspace.accounting.export"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            shouldBeBlocked
        >
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.exportDescription')}</Text>
            {sections.map((rows, sectionIndex) => (
                <View key={rows.at(0)?.settingName}>
                    {sectionIndex > 0 && <View style={[styles.mv3, styles.mh5, styles.borderTop]} />}
                    {rows.map((row) => (
                        <OfflineWithFeedback
                            key={row.settingName}
                            pendingAction={settingsPendingAction([row.settingName], businessCentralConfig?.pendingFields)}
                        >
                            <MenuItemField
                                name={row.label}
                                value={row.value}
                                onPress={() => Navigation.navigate(row.route)}
                            >
                                {areSettingsInErrorFields([row.settingName], businessCentralConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                            </MenuItemField>
                        </OfflineWithFeedback>
                    ))}
                </View>
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(BusinessCentralExportPage);
