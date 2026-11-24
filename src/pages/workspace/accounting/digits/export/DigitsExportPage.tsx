/**
 * The Digits Export page, where an admin chooses who exports reports and how expenses land in Digits: reimbursable
 * expenses as vendor bills and company card expenses as transactions.
 */
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
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import getDigitsCompanyCardAccount from './getDigitsCompanyCardAccount';

function DigitsExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const digitsConfig = policy?.connections?.digits?.config;
    const digitsData = policy?.connections?.digits?.data;
    const exporter = digitsConfig?.export?.exporter ?? policy?.owner;
    const exportReimbursable = digitsConfig?.export?.reimbursable ?? CONST.DIGITS_EXPORT_REIMBURSABLE.VENDOR_BILL;
    const exportDate = digitsConfig?.export?.exportDate ?? CONST.DIGITS_EXPORT_DATE.LAST_EXPENSE;
    const exportNonReimbursable = digitsConfig?.export?.nonReimbursable ?? CONST.DIGITS_EXPORT_NON_REIMBURSABLE.TRANSACTION;
    const defaultCompanyCardVendor = digitsData?.vendors?.find((vendor) => vendor.id === digitsConfig?.export?.defaultVendorID);
    const companyCardAccount = getDigitsCompanyCardAccount(policy);

    return (
        <ConnectionLayout
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS_ACCOUNTING.getRoute(policyID))}
            displayName="DigitsExportPage"
            headerTitle="workspace.accounting.export"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.digits.exportDescription')}</Text>
            </View>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.EXPORTER], digitsConfig?.pendingFields)}>
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.PREFERRED_EXPORTER}
                    name={translate('workspace.accounting.preferredExporter')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_PREFERRED_EXPORTER.getRoute(policyID)) : undefined)}
                    value={exporter}
                >
                    {areSettingsInErrorFields([CONST.DIGITS_CONFIG.EXPORTER], digitsConfig?.errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                </MenuItemField>
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            {/* Digits only takes reimbursable expenses as vendor bills, so this row shows the method without opening a picker */}
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.REIMBURSABLE], digitsConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.digits.exportReimbursable.label')}
                    value={translate(`workspace.digits.exportReimbursable.values.${exportReimbursable}.label`)}
                >
                    {areSettingsInErrorFields([CONST.DIGITS_CONFIG.REIMBURSABLE], digitsConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.EXPORT_DATE], digitsConfig?.pendingFields)}>
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.EXPORT_DATE}
                    name={translate('workspace.digits.exportDate.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_VENDOR_BILL_DATE.getRoute(policyID)) : undefined)}
                    value={translate(`workspace.digits.exportDate.values.${exportDate}.label`)}
                >
                    {areSettingsInErrorFields([CONST.DIGITS_CONFIG.EXPORT_DATE], digitsConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            {/* Digits only takes company card expenses as transactions, so this row shows the method without opening a picker */}
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.NON_REIMBURSABLE], digitsConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.digits.exportNonReimbursable.label')}
                    value={translate(`workspace.digits.exportNonReimbursable.values.${exportNonReimbursable}.label`)}
                >
                    {areSettingsInErrorFields([CONST.DIGITS_CONFIG.NON_REIMBURSABLE], digitsConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.DEFAULT_VENDORID], digitsConfig?.pendingFields)}>
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.DEFAULT_COMPANY_CARD_VENDOR}
                    name={translate('workspace.digits.defaultCompanyCardVendor.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_DEFAULT_COMPANY_CARD_VENDOR.getRoute(policyID)) : undefined)}
                    value={defaultCompanyCardVendor?.name}
                >
                    {areSettingsInErrorFields([CONST.DIGITS_CONFIG.DEFAULT_VENDORID], digitsConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.CREDIT_CARD_ACCOUNT_ID], digitsConfig?.pendingFields)}>
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.COMPANY_CARD_ACCOUNT}
                    name={translate('workspace.digits.companyCardAccount.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_COMPANY_CARD_ACCOUNT.getRoute(policyID)) : undefined)}
                    value={companyCardAccount?.name}
                >
                    {areSettingsInErrorFields([CONST.DIGITS_CONFIG.CREDIT_CARD_ACCOUNT_ID], digitsConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DigitsExportPage);
