import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getRouteParamForConnection} from '@libs/AccountingUtils';
import {toggleTravelBillingContinuousReconciliation} from '@libs/actions/TravelBilling';
import {getCardSettings, getConnectionBankAccountsForReconciliation} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getIsTravelBillingEnabled} from '@libs/TravelBillingUtils';

import RECONCILIATION_ACCOUNT_SETTINGS_TYPE from '@pages/workspace/accounting/reconciliation/constants';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type TravelBillingContinuousReconciliationSectionProps = {
    policy: OnyxEntry<Policy>;
    connectionName: ConnectionName;
    isAutoSyncEnabled: boolean;
    isPayableAccountSet: boolean;
};

function TravelBillingContinuousReconciliationSection({policy, connectionName, isAutoSyncEnabled, isPayableAccountSet}: TravelBillingContinuousReconciliationSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);
    const [travelBillingContinuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`);
    const [travelBillingContinuousReconciliationPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`);
    const [travelBillingContinuousReconciliationConnection] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_BILLING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`);
    const [travelBillingReconciliationBankAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`);
    const travelBillingReconciliationBankAccount = getConnectionBankAccountsForReconciliation(policy?.connections, connectionName).find(
        (account) => account.id === travelBillingReconciliationBankAccountID,
    );

    const isToggleDisabled = !isPayableAccountSet || !isAutoSyncEnabled;

    const navigateToTravelBillingReconciliationAccountSettings = () => {
        Navigation.navigate(
            createDynamicRoute(
                `${DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.path}?connection=${getRouteParamForConnection(connectionName)}&reconciliationAccountSettingsType=${
                    RECONCILIATION_ACCOUNT_SETTINGS_TYPE.TRAVEL_BILLING
                }`,
            ),
        );
    };

    if (!isTravelBillingEnabled) {
        return null;
    }

    return (
        <>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.syncTravelInvoicingSettlements')}
                isActive={!!travelBillingContinuousReconciliation}
                switchAccessibilityLabel={translate('workspace.accounting.syncTravelInvoicingSettlements')}
                disabled={isToggleDisabled}
                showLockIcon={isToggleDisabled}
                disabledText={
                    isPayableAccountSet
                        ? translate('workspace.accounting.syncTravelInvoicingSettlementsNoAutoSyncTooltip')
                        : translate('workspace.accounting.syncTravelInvoicingSettlementsNoAccountTooltip')
                }
                onToggle={(isEnabled) => {
                    if (isEnabled && !travelBillingReconciliationBankAccountID) {
                        navigateToTravelBillingReconciliationAccountSettings();
                        return;
                    }
                    toggleTravelBillingContinuousReconciliation(workspaceAccountID, isEnabled, connectionName, travelBillingContinuousReconciliationConnection);
                }}
                pendingAction={travelBillingContinuousReconciliationPendingAction}
                wrapperStyle={[styles.mv3, styles.ph5]}
            />
            {!!travelBillingContinuousReconciliation && (
                <OfflineWithFeedback pendingAction={travelBillingContinuousReconciliationPendingAction}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.accounting.reconciliationAccount')}
                        onPress={navigateToTravelBillingReconciliationAccountSettings}
                        title={travelBillingReconciliationBankAccount?.name}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
            )}
        </>
    );
}

export default TravelBillingContinuousReconciliationSection;
