import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useOnyx from '@hooks/useOnyx';

import {expensifyLoginsSelector, isCurrentUserValidated} from '@libs/UserUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isUserValidatedSelector} from '@selectors/Account';
import {createTimeSensitiveAdminPoliciesSelector} from '@selectors/Policy';
import {emailSelector} from '@selectors/Session';
import React from 'react';

import useBrokenDirectCompanyCardFeedsForAdmin from './hooks/useBrokenDirectCompanyCardFeedsForAdmin';
import useTimeSensitiveAddBankAccount from './hooks/useTimeSensitiveAddBankAccount';
import useTimeSensitiveAddPaymentCard from './hooks/useTimeSensitiveAddPaymentCard';
import useTimeSensitiveBilling from './hooks/useTimeSensitiveBilling';
import useTimeSensitiveCards from './hooks/useTimeSensitiveCards';
import useTimeSensitiveHomeAddress from './hooks/useTimeSensitiveHomeAddress';
import useTimeSensitiveLockedBankAccount from './hooks/useTimeSensitiveLockedBankAccount';
import useTimeSensitiveSignerInfo from './hooks/useTimeSensitiveSignerInfo';
import ActivateCard from './items/ActivateCard';
import AddBankAccount from './items/AddBankAccount';
import AddHomeAddress from './items/AddHomeAddress';
import AddPaymentCard from './items/AddPaymentCard';
import AddShippingAddress from './items/AddShippingAddress';
import AddVirtualCardPersonalDetails from './items/AddVirtualCardPersonalDetails';
import EnterSignerInfo from './items/EnterSignerInfo';
import FixCompanyCardConnection from './items/FixCompanyCardConnection';
import FixFailedBilling from './items/FixFailedBilling';
import FixPersonalCardConnection from './items/FixPersonalCardConnection';
import FixPolicyConnection from './items/FixPolicyConnection';
import ReviewCardFraud from './items/ReviewCardFraud';
import UnlockBankAccount from './items/UnlockBankAccount';
import ValidateAccount from './items/ValidateAccount';

type BrokenPersonalCardConnection = {
    /** The card ID associated with this connection */
    cardID: string;
};

/**
 * Builds the prioritized list of time-sensitive action rows for the Home page. Returns an empty array when the user
 * has no time-sensitive content, so the caller can decide whether to render the "Time sensitive" group at all.
 */
function useTimeSensitiveItems(): React.ReactNode[] {
    const {login} = useCurrentUserPersonalDetails();
    const isAnonymous = useIsAnonymousUser();

    // Use custom hooks for offers and cards (Release 3)
    const {shouldShowAddPaymentCard} = useTimeSensitiveAddPaymentCard();
    const {shouldShowAddBankAccount} = useTimeSensitiveAddBankAccount();
    const {
        shouldShowAddShippingAddress,
        shouldShowActivateCard,
        shouldShowReviewCardFraud,
        shouldShowAddVirtualCardPersonalDetails,
        cardsNeedingShippingAddress,
        cardsNeedingActivation,
        cardsWithFraud,
        virtualCardsNeedingPersonalDetails,
    } = useTimeSensitiveCards();
    const {shouldShowFixFailedBilling} = useTimeSensitiveBilling();
    const {shouldShowAddHomeAddress} = useTimeSensitiveHomeAddress();

    const [connectionSyncProgress] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    // the selector derives both, so this never deep-compares employeeList/connections/customUnits per policy
    const [adminPoliciesData] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: createTimeSensitiveAdminPoliciesSelector(login, connectionSyncProgress),
    });
    const adminPolicies = adminPoliciesData?.policies;
    const brokenPolicyConnections = adminPoliciesData?.brokenConnections ?? CONST.EMPTY_ARRAY;
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isUserValidatedSelector,
    });
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const {lockedBankAccounts} = useTimeSensitiveLockedBankAccount(adminPolicies);
    const {pendingSignerInfo} = useTimeSensitiveSignerInfo();

    // Get card feed errors for company card connections (Release 4)
    const cardFeedErrors = useCardFeedErrors();
    const brokenCompanyCardConnections = useBrokenDirectCompanyCardFeedsForAdmin(adminPolicies);

    // Get personal cards with broken connections
    const brokenPersonalCardConnections: BrokenPersonalCardConnection[] = [];
    const personalCardsWithBrokenConnection = cardFeedErrors.personalCardsWithBrokenConnection;
    if (personalCardsWithBrokenConnection) {
        for (const card of Object.values(personalCardsWithBrokenConnection)) {
            brokenPersonalCardConnections.push({
                cardID: String(card.cardID),
            });
        }
    }

    const isCurrentLoginValidated = isCurrentUserValidated(loginList, sessionEmail ?? login);
    const shouldShowValidateAccount = isUserValidated === false && !isAnonymous && !isCurrentLoginValidated;

    // Priority order:
    // 1. Validate account
    // 2. Fix failed billing (existing customers with declined cards)
    // 3. Potential card fraud
    // 4. Add payment card (trial ended, no payment card)
    // 5. Add bank account for a queued reimbursement
    // 6. Broken bank connections (company cards)
    // 7. Broken bank connections (personal cards)
    // 8. Locked bank accounts (workspace VBAs and personal)
    // 9. Enter signer info for global bank accounts
    // 10. Broken policy connections (accounting + HR)
    // 11. Expensify card shipping
    // 12. Expensify card activation
    // 13. Virtual Expensify card needs personal details
    const items: React.ReactNode[] = [];

    // Priority 1: Validate account
    if (shouldShowValidateAccount) {
        items.push(<ValidateAccount key="validate-account" />);
    }
    // Priority 1b: Add home address (commuter exclusions, homeAndOffice method)
    if (shouldShowAddHomeAddress) {
        items.push(<AddHomeAddress key="add-home-address" />);
    }
    // Priority 2: Failed billing for existing customers
    if (shouldShowFixFailedBilling) {
        items.push(<FixFailedBilling key="fix-failed-billing" />);
    }
    // Priority 3: Card fraud alerts
    if (shouldShowReviewCardFraud) {
        for (const card of cardsWithFraud) {
            if (!card.nameValuePairs?.possibleFraud) {
                continue;
            }
            items.push(
                <ReviewCardFraud
                    key={`fraud-${card.cardID}`}
                    possibleFraud={card.nameValuePairs.possibleFraud}
                />,
            );
        }
    }
    // Priority 4: Add payment card (trial ended, no payment card)
    if (shouldShowAddPaymentCard) {
        items.push(<AddPaymentCard key="add-payment-card" />);
    }
    // Priority 5: Add bank account for a queued reimbursement
    if (shouldShowAddBankAccount) {
        items.push(<AddBankAccount key="add-bank-account" />);
    }
    // Priority 6: Broken company card connections
    for (const connection of brokenCompanyCardConnections) {
        const card = cardFeedErrors.cardsWithBrokenFeedConnection[connection.cardID];
        if (!card) {
            continue;
        }
        items.push(
            <FixCompanyCardConnection
                key={`company-card-${connection.feedKey}`}
                card={card}
                policyID={connection.policyID}
                policyName={connection.policyName}
            />,
        );
    }
    // Priority 7: Broken personal card connections
    for (const connection of brokenPersonalCardConnections) {
        const card = cardFeedErrors.personalCardsWithBrokenConnection[connection.cardID];
        if (!card) {
            continue;
        }
        items.push(
            <FixPersonalCardConnection
                key={`personal-card-${connection.cardID}`}
                card={card}
            />,
        );
    }
    // Priority 8: Locked bank accounts
    for (const lockedBankAccount of lockedBankAccounts) {
        items.push(
            <UnlockBankAccount
                key={lockedBankAccount.key}
                bankAccountID={lockedBankAccount.bankAccountID}
                policyName={lockedBankAccount.policyName}
            />,
        );
    }
    // Priority 9: Enter signer info for global bank accounts
    for (const item of pendingSignerInfo) {
        items.push(
            <EnterSignerInfo
                key={`signer-${item.policyID}-${item.bankAccountID}`}
                policyID={item.policyID}
                bankAccountID={item.bankAccountID}
                bankAccountLastFour={item.bankAccountLastFour}
            />,
        );
    }
    // Priority 10: Broken policy connections (accounting + HR)
    for (const connection of brokenPolicyConnections) {
        items.push(
            <FixPolicyConnection
                key={`policy-connection-${connection.policyID}-${connection.connectionName}`}
                connectionName={connection.connectionName}
                policyID={connection.policyID}
                policyName={connection.policyName}
                integrationName={connection.integrationName}
            />,
        );
    }
    // Priority 11: Expensify card shipping
    if (shouldShowAddShippingAddress) {
        for (const card of cardsNeedingShippingAddress) {
            items.push(
                <AddShippingAddress
                    key={`shipping-${card.cardID}`}
                    card={card}
                />,
            );
        }
    }
    // Priority 12: Expensify card activation
    if (shouldShowActivateCard) {
        for (const card of cardsNeedingActivation) {
            items.push(
                <ActivateCard
                    key={`activate-${card.cardID}`}
                    card={card}
                />,
            );
        }
    }
    // Priority 13: Virtual Expensify card needs personal details before reveal
    if (shouldShowAddVirtualCardPersonalDetails) {
        for (const card of virtualCardsNeedingPersonalDetails) {
            items.push(
                <AddVirtualCardPersonalDetails
                    key={`virtual-card-details-${card.cardID}`}
                    card={card}
                />,
            );
        }
    }

    return items;
}

export default useTimeSensitiveItems;
