import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const payableAccount = [CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT];

function QuickbooksTravelInvoicingConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {creditCards} = policy?.connections?.quickbooksOnline?.data ?? {};
    const travelPayableAccount = creditCards?.find((a) => a.id === qboConfig?.travelInvoicingPayableAccountID);

    return (
        <ConnectionLayout
            displayName="QuickbooksTravelInvoicingConfigurationPage"
            headerTitle="workspace.common.travelInvoicing"
            title="workspace.qbo.travelInvoicingDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID))}
        >
            <MenuItemWithTopDescription
                title={translate(`workspace.qbo.accounts.${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}`)}
                description={translate('workspace.accounting.exportAs')}
                interactive={false}
            />
            <OfflineWithFeedback
                pendingAction={settingsPendingAction(payableAccount, qboConfig?.pendingFields)}
                errorRowStyles={[styles.ph5]}
            >
                <MenuItemWithTopDescription
                    title={travelPayableAccount?.name}
                    description={translate('workspace.qbo.creditCardAccount')}
                    onPress={() => {
                        if (!policyID) {
                            return;
                        }
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_INVOICING_PAYABLE_ACCOUNT_SELECT.getRoute(policyID));
                    }}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields(payableAccount, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksTravelInvoicingConfigurationPage);
