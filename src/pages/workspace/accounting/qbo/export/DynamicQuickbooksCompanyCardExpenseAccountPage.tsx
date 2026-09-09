import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getQBONonReimbursableExportAccountType} from '@libs/ConnectionUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import {getQuickbooksOnlineIntegrationName} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function DynamicQuickbooksCompanyCardExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const nonReimbursableBillDefaultVendorObject = vendors?.find((vendor) => vendor.id === qboConfig?.nonReimbursableBillDefaultVendor);
    const nonReimbursableCreditCardDefaultVendorObject = vendors?.find((vendor) => vendor.id === qboConfig?.nonReimbursableCreditCardDefaultVendor);
    // This page is the QBO-only default-vendor editor: gate the row on QBO's own non-reimbursable export mode rather than the cross-integration `hasVendorFeature`, so an Intacct workspace whose QBO connection is in Vendor Bill mode does not get a QBO default-vendor row whose target setting isn't active.
    const qboNonReimbursableDestination = qboConfig?.nonReimbursableExpensesExportDestination;
    const isVendorFeatureAvailable =
        qboNonReimbursableDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD ||
        qboNonReimbursableDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD;
    // The auto-created fallback vendor is named after the card type, so the debit-card path must not advertise the credit-card one.
    const fallbackVendorName =
        qboNonReimbursableDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD
            ? CONST.NON_REIMBURSABLE_FALLBACK_VENDOR_NAME.DEBIT_CARD
            : CONST.NON_REIMBURSABLE_FALLBACK_VENDOR_NAME.CREDIT_CARD;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.path);
    let nonReimbursableExportDescription;
    if (qboNonReimbursableDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD) {
        nonReimbursableExportDescription = translate('workspace.qbo.creditCardExportDescription', integrationName);
    } else if (qboNonReimbursableDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD) {
        nonReimbursableExportDescription = translate('workspace.qbo.debitCardExportDescription', integrationName);
    } else if (qboNonReimbursableDestination) {
        nonReimbursableExportDescription = translate(`workspace.qbo.accounts.${qboNonReimbursableDestination}Description`);
    }

    const sections = [
        {
            title: qboNonReimbursableDestination ? translate(`workspace.qbo.accounts.${qboNonReimbursableDestination}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_CARD_SELECT.path)),
            hintText: nonReimbursableExportDescription,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_EXPORT_DESTINATION],
        },
        {
            title: qboConfig?.nonReimbursableExpensesAccount?.name,
            description: getQBONonReimbursableExportAccountType(translate, qboConfig?.nonReimbursableExpensesExportDestination),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.path));
            },
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT],
        },
    ];

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName="DynamicQuickbooksCompanyCardExpenseAccountPage"
            headerTitle="workspace.accounting.exportCompanyCard"
            title="workspace.qbo.exportCompanyCardsDescription"
            titleAlreadyTranslated={translate('workspace.qbo.exportCompanyCardsDescription', integrationName)}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(backPath)}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.title}
                    pendingAction={settingsPendingAction(section.subscribedSettings, qboConfig?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        onPress={section.onPress}
                        brickRoadIndicator={areSettingsInErrorFields(section.subscribedSettings, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        shouldShowRightIcon
                        hintText={section.hintText}
                    />
                </OfflineWithFeedback>
            ))}
            {isVendorFeatureAvailable && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_DEFAULT_VENDOR], qboConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={nonReimbursableCreditCardDefaultVendorObject?.name}
                        description={translate('workspace.accounting.defaultVendor')}
                        // Only the card/debit-card path auto-creates a fallback vendor when nothing auto-matches, so the two-state helper copy is scoped to this branch and deliberately not rendered on the Vendor Bill row below.
                        helperText={translate('workspace.accounting.defaultVendorHelperText', !!nonReimbursableCreditCardDefaultVendorObject, fallbackVendorName)}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_CREDIT_CARD_DEFAULT_VENDOR_SELECT.getRoute(policyID))}
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_DEFAULT_VENDOR], qboConfig?.errorFields)
                                ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                : undefined
                        }
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
            )}
            {qboNonReimbursableDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qboConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={nonReimbursableBillDefaultVendorObject?.name}
                        description={translate('workspace.accounting.defaultVendor')}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.getRoute(policyID))}
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qboConfig?.errorFields)
                                ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                : undefined
                        }
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DynamicQuickbooksCompanyCardExpenseAccountPage);
