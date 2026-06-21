import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

const payableAccountSetting = [CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT];

function DynamicSageIntacctTravelInvoicingConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const config = policy?.connections?.intacct?.config;
    const travelPayableAccount = policy?.connections?.intacct?.data?.creditCards?.find((account) => account.name === config?.export?.travelInvoicingPayableAccountID);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TRAVEL_INVOICING_CONFIGURATION.path);
    const travelInvoicingPath = `${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TRAVEL_INVOICING_CONFIGURATION.path}`;

    return (
        <ConnectionLayout
            displayName="SageIntacctTravelInvoicingConfigurationPage"
            headerTitle="workspace.common.travelInvoicing"
            title="workspace.sageIntacct.travelInvoicingDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onBackButtonPress={() => Navigation.goBack(backPath)}
        >
            <MenuItemWithTopDescription
                title={translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE}`)}
                description={translate('workspace.accounting.exportAs')}
                interactive={false}
            />
            <OfflineWithFeedback
                pendingAction={settingsPendingAction(payableAccountSetting, config?.pendingFields)}
                errorRowStyles={[styles.ph5]}
            >
                <MenuItemWithTopDescription
                    title={travelPayableAccount?.name}
                    description={translate('workspace.sageIntacct.creditCardAccount')}
                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TRAVEL_INVOICING_PAYABLE_ACCOUNT_SELECT.path, travelInvoicingPath))}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields(payableAccountSetting, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DynamicSageIntacctTravelInvoicingConfigurationPage);
