import ConnectionLayout from '@components/ConnectionLayout';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {
    areSettingsInErrorFields,
    formatSageIntacctJournalLabel,
    formatSageIntacctLiabilityAccount,
    getResolvedSageIntacctReconciliationJournal,
    getSageIntacctJournalBookLabel,
    isSageIntacctReconciliationJournalValid,
    settingsPendingAction,
} from '@libs/PolicyUtils';

import TravelBillingContinuousReconciliationSection from '@pages/workspace/accounting/common/TravelBillingContinuousReconciliationSection';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

const payableAccountSetting = [CONST.SAGE_INTACCT_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT];
const reconciliationJournalSetting = [CONST.SAGE_INTACCT_CONFIG.RECONCILIATION_JOURNAL];

function DynamicSageIntacctTravelBillingConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [travelBillingContinuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TRAVEL_BILLING_CONFIGURATION.path);
    const config = policy?.connections?.intacct?.config;
    const travelPayableAccount = policy?.connections?.intacct?.data?.creditCards?.find((account) => account.name === config?.export?.travelInvoicingPayableAccountID);
    const travelLiabilityAccount = formatSageIntacctLiabilityAccount(travelPayableAccount?.value, travelPayableAccount?.liabilityAccountTitle);
    const resolvedJournal = getResolvedSageIntacctReconciliationJournal(policy, !!travelBillingContinuousReconciliation);
    const isJournalValid = isSageIntacctReconciliationJournalValid(policy, resolvedJournal);

    return (
        <ConnectionLayout
            displayName="SageIntacctTravelBillingConfigurationPage"
            headerTitle="workspace.common.travelBilling"
            title="workspace.sageIntacct.travelBillingDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onBackButtonPress={() => Navigation.goBack(backPath)}
        >
            <MenuItemField
                name={translate('workspace.accounting.exportAs')}
                value={translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE}`)}
            />
            <OfflineWithFeedback
                pendingAction={settingsPendingAction(payableAccountSetting, config?.pendingFields)}
                errorRowStyles={[styles.ph5]}
            >
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.SAGE_INTACCT.TRAVEL_BILLING_CREDIT_CARD_ACCOUNT}
                    name={translate('workspace.sageIntacct.creditCardAccount')}
                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TRAVEL_BILLING_PAYABLE_ACCOUNT_SELECT.path))}
                    value={travelPayableAccount?.name}
                >
                    {areSettingsInErrorFields(payableAccountSetting, config?.errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                </MenuItemField>
                {!!travelLiabilityAccount && (
                    <FormHelpMessage
                        isError={false}
                        shouldShowRedDotIndicator={false}
                        message={translate('workspace.sageIntacct.reconciliation.liabilityAccountSubtitle', travelLiabilityAccount)}
                        style={[styles.mt0, styles.mb0, styles.ph5, styles.pb2]}
                    />
                )}
            </OfflineWithFeedback>
            <OfflineWithFeedback
                pendingAction={settingsPendingAction(reconciliationJournalSetting, config?.pendingFields)}
                errorRowStyles={[styles.ph5]}
            >
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.SAGE_INTACCT.TRAVEL_BILLING_JOURNAL}
                    name={translate('workspace.sageIntacct.reconciliation.journal')}
                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_RECONCILIATION_JOURNAL_SELECT.path))}
                    value={formatSageIntacctJournalLabel(resolvedJournal)}
                >
                    {areSettingsInErrorFields(reconciliationJournalSetting, config?.errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                </MenuItemField>
                {!!resolvedJournal && (
                    <FormHelpMessage
                        isError={false}
                        shouldShowRedDotIndicator={false}
                        message={getSageIntacctJournalBookLabel(resolvedJournal.value, translate)}
                        style={[styles.mt0, styles.mb0, styles.ph5, styles.pb2]}
                    />
                )}
            </OfflineWithFeedback>
            <TravelBillingContinuousReconciliationSection
                policy={policy}
                connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.TRAVEL_BILLING_CONTINUOUS_RECONCILIATION_SWITCH.SAGE_INTACCT}
                reconciliationAccountSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.TRAVEL_BILLING_RECONCILIATION_ACCOUNT.SAGE_INTACCT}
                isAutoSyncEnabled={!!config?.autoSync?.enabled}
                // Gate the toggle on both a payable account and a valid reconciliation journal because both are required for Intacct.
                isPayableAccountSet={!!config?.export?.travelInvoicingPayableAccountID && isJournalValid}
            />
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DynamicSageIntacctTravelBillingConfigurationPage);
