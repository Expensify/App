import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {View} from 'react-native';

function DualEntryExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const policyOwner = policy?.owner;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const exporter = dualentryConfig?.export?.exporter ?? policyOwner;
    const exportReimbursable = dualentryConfig?.export?.reimbursable ?? CONST.DUALENTRY_EXPORT_REIMBURSABLE.VENDOR_BILL;
    const exportDate = dualentryConfig?.export?.exportDate ?? CONST.DUALENTRY_EXPORT_DATE.LAST_EXPENSE;
    const exportNonReimbursable = dualentryConfig?.export?.nonReimbursable ?? CONST.DUALENTRY_EXPORT_NON_REIMBURSABLE.DIRECT_EXPENSE;
    const defaultCompanyCardVendor = dualentryData?.vendors?.find((vendor) => vendor.id === dualentryConfig?.export?.defaultVendorID);
    const companyCardAccountID = dualentryConfig?.export?.creditCardAccountID;
    const companyCardAccount = dualentryData?.accounts?.find((account) => account.id === companyCardAccountID);
    const expensifyCardAccountID = dualentryConfig?.export?.expensifyCardAccountID;
    const expensifyCardAccount = dualentryData?.accounts?.find((account) => account.id === expensifyCardAccountID);
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isExpensifyCardsEnabled = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));

    return (
        <ConnectionLayout
            displayName="DualEntryExportPage"
            headerTitle="workspace.accounting.export"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.dualEntry.exportDescription')}</Text>
            </View>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.EXPORTER], dualentryConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={exporter}
                    description={translate('workspace.accounting.preferredExporter')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_PREFERRED_EXPORTER.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.EXPORTER], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.REIMBURSABLE], dualentryConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.dualEntry.exportReimbursable.values.${exportReimbursable}.label`)}
                    description={translate('workspace.dualEntry.exportReimbursable.label')}
                    onPress={() => {}}
                    interactive={false}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.REIMBURSABLE], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.EXPORT_DATE], dualentryConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.dualEntry.exportDate.values.${exportDate}.label`)}
                    description={translate('workspace.dualEntry.exportDate.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_VENDOR_BILL_DATE.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.EXPORT_DATE], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.NON_REIMBURSABLE], dualentryConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.dualEntry.exportNonReimbursable.values.${exportNonReimbursable}.label`)}
                    description={translate('workspace.dualEntry.exportNonReimbursable.label')}
                    onPress={() => {}}
                    interactive={false}
                    brickRoadIndicator={
                        areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.NON_REIMBURSABLE], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                    }
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.DEFAULT_VENDORID], dualentryConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={defaultCompanyCardVendor?.name}
                    description={translate('workspace.dualEntry.defaultCompanyCardVendor.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_DEFAULT_COMPANY_CARD_VENDOR.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={
                        areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.DEFAULT_VENDORID], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                    }
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.CREDIT_CARD_ACCOUNT_ID], dualentryConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={companyCardAccount ? `${companyCardAccount?.id} ${companyCardAccount?.name}` : undefined}
                    description={translate('workspace.dualEntry.companyCardAccount.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_COMPANY_CARD_ACCOUNT.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={
                        areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.CREDIT_CARD_ACCOUNT_ID], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                    }
                />
            </OfflineWithFeedback>
            {isExpensifyCardsEnabled && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.EXPENSIFY_CARD_ACCOUNT_ID], dualentryConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={expensifyCardAccount ? `${expensifyCardAccount?.id} ${expensifyCardAccount?.name}` : undefined}
                        description={translate('workspace.dualEntry.expensifyCardAccount.label')}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_EXPENSIFY_CARD_ACCOUNT.getRoute(policyID)) : undefined)}
                        shouldShowRightIcon
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.EXPENSIFY_CARD_ACCOUNT_ID], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DualEntryExportPage);
