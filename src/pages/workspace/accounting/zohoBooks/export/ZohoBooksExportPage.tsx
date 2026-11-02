/**
 * Zoho Books export settings: the preferred exporter, vendor bill date, and the vendor and account company card expenses export with.
 * Reimbursable and company card export types are shown read-only because Zoho Books supports one type each.
 */
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, getZohoBooksVendors, settingsPendingAction} from '@libs/PolicyUtils';

import {getAccountingSettingsRoute} from '@pages/workspace/connections/utils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {View} from 'react-native';

function ZohoBooksExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();
    const policyOwner = policy?.owner;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const exporter = zohoBooksConfig?.export?.exporter ?? policyOwner;
    const exportReimbursable = zohoBooksConfig?.export?.reimbursable ?? CONST.ZOHO_BOOKS_EXPORT_REIMBURSABLE.VENDOR_BILL;
    const exportDate = zohoBooksConfig?.export?.exportDate ?? CONST.ZOHO_BOOKS_EXPORT_DATE.LAST_EXPENSE;
    const exportNonReimbursable = zohoBooksConfig?.export?.nonReimbursable ?? CONST.ZOHO_BOOKS_EXPORT_NON_REIMBURSABLE.EXPENSE;
    const defaultCompanyCardVendor = getZohoBooksVendors(policy).find((vendor) => vendor.id === zohoBooksConfig?.export?.defaultVendorID);
    const companyCardAccount = zohoBooksData?.bankAccounts?.find((account) => account.id === zohoBooksConfig?.export?.creditCardAccountID);

    return (
        <ConnectionLayout
            onBackButtonPress={() => Navigation.goBack(getAccountingSettingsRoute(isUnifiedConnectionsBetaEnabled, policyID))}
            displayName="ZohoBooksExportPage"
            headerTitle="workspace.accounting.export"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.exportDescription')}</Text>
            </View>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.EXPORTER], zohoBooksConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.accounting.preferredExporter')}
                    value={exporter}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_PREFERRED_EXPORTER.getRoute(policyID)) : undefined)}
                >
                    {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.EXPORTER], zohoBooksConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.REIMBURSABLE], zohoBooksConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.zohoBooks.exportReimbursable.label')}
                    value={translate(`workspace.zohoBooks.exportReimbursable.values.${exportReimbursable}.label`)}
                >
                    {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.REIMBURSABLE], zohoBooksConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.EXPORT_DATE], zohoBooksConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.zohoBooks.exportDate.label')}
                    value={translate(`workspace.zohoBooks.exportDate.values.${exportDate}.label`)}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_VENDOR_BILL_DATE.getRoute(policyID)) : undefined)}
                >
                    {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.EXPORT_DATE], zohoBooksConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.NON_REIMBURSABLE], zohoBooksConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.zohoBooks.exportNonReimbursable.label')}
                    value={translate(`workspace.zohoBooks.exportNonReimbursable.values.${exportNonReimbursable}.label`)}
                >
                    {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.NON_REIMBURSABLE], zohoBooksConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.DEFAULT_VENDORID], zohoBooksConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.zohoBooks.defaultCompanyCardVendor.label')}
                    value={defaultCompanyCardVendor?.name}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_DEFAULT_COMPANY_CARD_VENDOR.getRoute(policyID)) : undefined)}
                >
                    {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.DEFAULT_VENDORID], zohoBooksConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.CREDIT_CARD_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.zohoBooks.companyCardAccount.label')}
                    value={companyCardAccount?.name}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_COMPANY_CARD_ACCOUNT.getRoute(policyID)) : undefined)}
                >
                    {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.CREDIT_CARD_ACCOUNT_ID], zohoBooksConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(ZohoBooksExportPage);
