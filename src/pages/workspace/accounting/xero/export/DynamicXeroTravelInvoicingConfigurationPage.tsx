import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

const payableAccountSetting = [CONST.XERO_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT];

function DynamicXeroTravelInvoicingConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const config = policy?.connections?.xero?.config;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_TRAVEL_INVOICING_CONFIGURATION.path);
    const travelInvoicingPath = `${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.path}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_TRAVEL_INVOICING_CONFIGURATION.path}`;

    const {bankAccounts} = policy?.connections?.xero?.data ?? {};
    const travelPayableAccount = bankAccounts?.find((account) => account.id === config?.export?.travelInvoicingPayableAccountID);

    return (
        <ConnectionLayout
            displayName="DynamicXeroTravelInvoicingConfigurationPage"
            headerTitle="workspace.common.travelInvoicing"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            onBackButtonPress={() => Navigation.goBack(backPath)}
        >
            <MenuItemWithTopDescription
                title={translate('workspace.xero.bankTransactions')}
                description={translate('workspace.accounting.exportAs')}
                helperText={translate('workspace.xero.travelInvoicingDescription')}
                interactive={false}
                shouldShowRightIcon={false}
            />
            <OfflineWithFeedback
                pendingAction={settingsPendingAction(payableAccountSetting, config?.pendingFields)}
                errorRowStyles={[styles.ph5]}
            >
                <MenuItemWithTopDescription
                    title={travelPayableAccount?.name}
                    description={translate('workspace.common.travelInvoicingPayableAccount')}
                    onPress={() => {
                        if (!policyID) {
                            return;
                        }
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_TRAVEL_INVOICING_PAYABLE_ACCOUNT_SELECT.path, travelInvoicingPath));
                    }}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields(payableAccountSetting, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DynamicXeroTravelInvoicingConfigurationPage);
