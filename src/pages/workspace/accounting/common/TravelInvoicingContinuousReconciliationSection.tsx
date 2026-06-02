import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getRouteParamForConnection} from '@libs/AccountingUtils';
import {toggleTravelInvoicingContinuousReconciliation} from '@libs/actions/TravelInvoicing';
import {getCardSettings, getConnectionBankAccountsForReconciliation} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getIsTravelInvoicingEnabled} from '@libs/TravelInvoicingUtils';
import RECONCILIATION_ACCOUNT_SETTINGS_TYPE from '@pages/workspace/accounting/reconciliation/constants';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import type {ConnectionName} from '@src/types/onyx/Policy';

type TravelInvoicingContinuousReconciliationSectionProps = {
    policy: OnyxEntry<Policy>;
    connectionName: ConnectionName;
    isAutoSyncEnabled: boolean;
    toggleWrapperStyle?: StyleProp<ViewStyle>;
    menuItemWrapperStyle?: StyleProp<ViewStyle>;
};

function TravelInvoicingContinuousReconciliationSection({
    policy,
    connectionName,
    isAutoSyncEnabled,
    toggleWrapperStyle,
    menuItemWrapperStyle,
}: TravelInvoicingContinuousReconciliationSectionProps) {
    const {translate} = useLocalize();
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelInvoicingEnabled = getIsTravelInvoicingEnabled(travelSettings);
    const [travelInvoicingContinuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`);
    const [travelInvoicingContinuousReconciliationPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`);
    const [travelInvoicingContinuousReconciliationConnection] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`);
    const [travelInvoicingReconciliationBankAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`);
    const travelInvoicingReconciliationBankAccount = getConnectionBankAccountsForReconciliation(policy?.connections, connectionName).find(
        (account) => account.id === travelInvoicingReconciliationBankAccountID,
    );

    const navigateToTravelInvoicingReconciliationAccountSettings = () => {
        Navigation.navigate(
            createDynamicRoute(
                `${DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.path}?connection=${getRouteParamForConnection(connectionName)}&reconciliationAccountSettingsType=${
                    RECONCILIATION_ACCOUNT_SETTINGS_TYPE.TRAVEL_INVOICING
                }`,
            ),
        );
    };

    if (!isTravelInvoicingEnabled) {
        return null;
    }

    return (
        <>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.syncTravelInvoicingSettlements')}
                isActive={!!travelInvoicingContinuousReconciliation}
                switchAccessibilityLabel={translate('workspace.accounting.syncTravelInvoicingSettlements')}
                disabled={!isAutoSyncEnabled}
                onToggle={(isEnabled) => {
                    toggleTravelInvoicingContinuousReconciliation(workspaceAccountID, isEnabled, connectionName, travelInvoicingContinuousReconciliationConnection);
                    if (isEnabled) {
                        navigateToTravelInvoicingReconciliationAccountSettings();
                    }
                }}
                pendingAction={travelInvoicingContinuousReconciliationPendingAction}
                wrapperStyle={toggleWrapperStyle}
            />
            {!!travelInvoicingContinuousReconciliation && (
                <OfflineWithFeedback pendingAction={travelInvoicingContinuousReconciliationPendingAction}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.accounting.reconciliationAccount')}
                        onPress={navigateToTravelInvoicingReconciliationAccountSettings}
                        title={travelInvoicingReconciliationBankAccount?.name}
                        shouldShowRightIcon
                        wrapperStyle={menuItemWrapperStyle}
                    />
                </OfflineWithFeedback>
            )}
        </>
    );
}

export default TravelInvoicingContinuousReconciliationSection;
