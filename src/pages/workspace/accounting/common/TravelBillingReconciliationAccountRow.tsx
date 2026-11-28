/**
 * The "Reconciliation account" row of the Travel Billing section. It is its own component so that only this row subscribes to the reconciliation account, and only while continuous reconciliation is on.
 */
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getConnectionBankAccountsForReconciliation} from '@libs/CardUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type Policy from '@src/types/onyx/Policy';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type TravelBillingReconciliationAccountRowProps = {
    workspaceAccountID: number;
    connections: Policy['connections'];
    connectionName: ConnectionName;
    pendingAction: OnyxEntry<PendingAction>;
    sentryLabel: SentryLabel;
    onPress: () => void;
};

function TravelBillingReconciliationAccountRow({workspaceAccountID, connections, connectionName, pendingAction, sentryLabel, onPress}: TravelBillingReconciliationAccountRowProps) {
    const {translate} = useLocalize();
    const [travelBillingReconciliationBankAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`);
    const travelBillingReconciliationBankAccount = getConnectionBankAccountsForReconciliation(connections, connectionName).find(
        (account) => account.id === travelBillingReconciliationBankAccountID,
    );

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItemField
                sentryLabel={sentryLabel}
                name={translate('workspace.accounting.reconciliationAccount')}
                onPress={onPress}
                value={travelBillingReconciliationBankAccount?.name}
            />
        </OfflineWithFeedback>
    );
}

export default TravelBillingReconciliationAccountRow;
