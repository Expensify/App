import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
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

import {View} from 'react-native';

function CampfireExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const policyOwner = policy?.owner;
    const campfireConfig = policy?.connections?.campfire?.config;
    const campfireData = policy?.connections?.campfire?.data;
    const exporter = campfireConfig?.export?.exporter ?? policyOwner;
    const exportReimbursable = campfireConfig?.export?.reimbursable ?? CONST.CAMPFIRE_EXPORT_REIMBURSABLE.VENDOR_BILL;
    const exportDate = campfireConfig?.export?.exportDate ?? CONST.CAMPFIRE_EXPORT_DATE.LAST_EXPENSE;
    const exportNonReimbursable = campfireConfig?.export?.nonReimbursable ?? CONST.CAMPFIRE_EXPORT_NON_REIMBURSABLE.JOURNAL_ENTRY;
    const defaultCompanyCardVendor = campfireData?.vendors?.find((vendor) => vendor.id === campfireConfig?.export?.defaultVendorID);
    const companyCardAccountID = campfireConfig?.export?.creditCardAccountID;
    const companyCardAccount = campfireData?.accounts?.find((account) => account.id === companyCardAccountID);

    return (
        <ConnectionLayout
            displayName="CampfireExportPage"
            headerTitle="workspace.accounting.export"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.campfire.exportDescription')}</Text>
            </View>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.EXPORTER], campfireConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={exporter}
                    description={translate('workspace.accounting.preferredExporter')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_PREFERRED_EXPORTER.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.EXPORTER], campfireConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.REIMBURSABLE], campfireConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.campfire.exportReimbursable.values.${exportReimbursable}.label`)}
                    description={translate('workspace.campfire.exportReimbursable.label')}
                    onPress={() => {}}
                    interactive={false}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.REIMBURSABLE], campfireConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.EXPORT_DATE], campfireConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.campfire.exportDate.values.${exportDate}.label`)}
                    description={translate('workspace.campfire.exportDate.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_VENDOR_BILL_DATE.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.EXPORT_DATE], campfireConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.NON_REIMBURSABLE], campfireConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.campfire.exportNonReimbursable.values.${exportNonReimbursable}.label`)}
                    description={translate('workspace.campfire.exportNonReimbursable.label')}
                    onPress={() => {}}
                    interactive={false}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.NON_REIMBURSABLE], campfireConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.DEFAULT_VENDORID], campfireConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={defaultCompanyCardVendor?.name}
                    description={translate('workspace.campfire.defaultCompanyCardVendor.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_DEFAULT_COMPANY_CARD_VENDOR.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.DEFAULT_VENDORID], campfireConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.CREDIT_CARD_ACCOUNT_ID], campfireConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={companyCardAccount ? `${companyCardAccount?.id} ${companyCardAccount?.name}` : undefined}
                    description={translate('workspace.campfire.companyCardAccount.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_COMPANY_CARD_ACCOUNT.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={
                        areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.CREDIT_CARD_ACCOUNT_ID], campfireConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                    }
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(CampfireExportPage);
