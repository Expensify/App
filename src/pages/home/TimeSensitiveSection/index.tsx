import {useFocusEffect} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {activeAdminPoliciesSelector} from '@selectors/Policy';
import {emailSelector} from '@selectors/Session';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import WidgetContainer from '@components/WidgetContainer';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasSynchronizationErrorMessage, isConnectionInProgress} from '@libs/actions/connections';
import {getConnectedHRProvider} from '@libs/HRUtils';
import {expensifyLoginsSelector, isCurrentUserValidated} from '@libs/UserUtils';
import HomeSectionExpandToggle from '@pages/home/HomeSectionExpandToggle';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName, PolicyConnectionName} from '@src/types/onyx/Policy';
import useBrokenDirectCompanyCardFeedsForAdmin from './hooks/useBrokenDirectCompanyCardFeedsForAdmin';
import useTimeSensitiveAddPaymentCard from './hooks/useTimeSensitiveAddPaymentCard';
import useTimeSensitiveBilling from './hooks/useTimeSensitiveBilling';
import useTimeSensitiveCards from './hooks/useTimeSensitiveCards';
import useTimeSensitiveLockedBankAccount from './hooks/useTimeSensitiveLockedBankAccount';
import useTimeSensitiveSignerInfo from './hooks/useTimeSensitiveSignerInfo';
import ActivateCard from './items/ActivateCard';
import AddPaymentCard from './items/AddPaymentCard';
import AddShippingAddress from './items/AddShippingAddress';
import EnterSignerInfo from './items/EnterSignerInfo';
import FixCompanyCardConnection from './items/FixCompanyCardConnection';
import FixFailedBilling from './items/FixFailedBilling';
import FixPersonalCardConnection from './items/FixPersonalCardConnection';
import FixPolicyConnection from './items/FixPolicyConnection';
import ReviewCardFraud from './items/ReviewCardFraud';
import UnlockBankAccount from './items/UnlockBankAccount';
import ValidateAccount from './items/ValidateAccount';

type BrokenPolicyConnection = {
    /** The policy ID associated with this connection */
    policyID: string;

    /** The policy name associated with this connection */
    policyName: string;

    /** The connection name that has an error */
    connectionName: PolicyConnectionName;

    /** Human-readable integration name (e.g. "QuickBooks Online", "Gusto", "BambooHR"). */
    integrationName: string;
};

type BrokenPersonalCardConnection = {
    /** The card ID associated with this connection */
    cardID: string;
};

function TimeSensitiveSection() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {login} = useCurrentUserPersonalDetails();
    const isAnonymous = useIsAnonymousUser();
    const [isExpanded, setIsExpanded] = useState(false);

    useFocusEffect(
        useCallback(() => {
            return () => setIsExpanded(false);
        }, []),
    );

    // Use custom hooks for offers and cards (Release 3)
    const {shouldShowAddPaymentCard} = useTimeSensitiveAddPaymentCard();
    const {shouldShowAddShippingAddress, shouldShowActivateCard, shouldShowReviewCardFraud, cardsNeedingShippingAddress, cardsNeedingActivation, cardsWithFraud} = useTimeSensitiveCards();
    const {shouldShowFixFailedBilling} = useTimeSensitiveBilling();

    // Selector for filtering admin policies (Release 4)
    const adminPoliciesSelectorWrapper = useCallback((policies: OnyxCollection<Policy>) => activeAdminPoliciesSelector(policies, login ?? ''), [login]);
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: adminPoliciesSelectorWrapper,
    });
    const [connectionSyncProgress] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isUserValidatedSelector,
    });
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const {lockedBankAccounts} = useTimeSensitiveLockedBankAccount(adminPolicies);
    const {shouldShowEnterSignerInfo, pendingSignerInfo} = useTimeSensitiveSignerInfo();

    // Get card feed errors for company card connections (Release 4)
    const cardFeedErrors = useCardFeedErrors();
    const brokenCompanyCardConnections = useBrokenDirectCompanyCardFeedsForAdmin(adminPolicies);

    // Find policies with broken connections (accounting + HR, only for admins)
    const brokenPolicyConnections: BrokenPolicyConnection[] = [];
    for (const policy of adminPolicies ?? []) {
        const policyConnections = policy.connections;
        if (!policyConnections) {
            continue;
        }

        // Check if there's a sync in progress for this policy using the proper check that handles JOB_DONE and timeout
        const syncProgress = connectionSyncProgress?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`];
        const isSyncInProgress = isConnectionInProgress(syncProgress, policy);

        for (const connectionName of Object.keys(policyConnections) as ConnectionName[]) {
            if (hasSynchronizationErrorMessage(policy, connectionName, isSyncInProgress)) {
                const integrationName =
                    connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_HR
                        ? (getConnectedHRProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName])
                        : CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName];
                brokenPolicyConnections.push({
                    policyID: policy.id,
                    policyName: policy.name,
                    connectionName,
                    integrationName,
                });
            }
        }
    }

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

    const hasBrokenCompanyCards = brokenCompanyCardConnections.length > 0;
    const hasBrokenPersonalCards = brokenPersonalCardConnections.length > 0;
    const hasBrokenPolicyConnections = brokenPolicyConnections.length > 0;
    const isCurrentLoginValidated = isCurrentUserValidated(loginList, sessionEmail ?? login);
    const shouldShowValidateAccount = isUserValidated === false && !isAnonymous && !isCurrentLoginValidated;

    // This guard must exactly match the conditions used to render each widget below.
    // If a widget has additional conditions in the render (e.g. && !!discountInfo), those
    // must be reflected here to avoid showing an empty "Time sensitive" section.
    const hasAnyTimeSensitiveContent =
        lockedBankAccounts.length > 0 ||
        shouldShowEnterSignerInfo ||
        shouldShowValidateAccount ||
        shouldShowFixFailedBilling ||
        shouldShowReviewCardFraud ||
        shouldShowAddPaymentCard ||
        hasBrokenCompanyCards ||
        hasBrokenPersonalCards ||
        hasBrokenPolicyConnections ||
        shouldShowAddShippingAddress ||
        shouldShowActivateCard;

    if (!hasAnyTimeSensitiveContent) {
        return null;
    }

    // Priority order:
    // 1. Validate account
    // 2. Fix failed billing (existing customers with declined cards)
    // 3. Potential card fraud
    // 4. Add payment card (trial ended, no payment card)
    // 5. Broken bank connections (company cards)
    // 6. Broken bank connections (personal cards)
    // 7. Locked bank accounts (workspace VBAs and personal)
    // 8. Enter signer info for global bank accounts
    // 9. Broken policy connections (accounting + HR)
    // 10. Expensify card shipping
    // 11. Expensify card activation
    const items: React.ReactNode[] = [];

    // Priority 1: Validate account
    if (shouldShowValidateAccount) {
        items.push(<ValidateAccount key="validate-account" />);
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
    // Priority 5: Broken company card connections
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
    // Priority 6: Broken personal card connections
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
    // Priority 7: Locked bank accounts
    for (const lockedBankAccount of lockedBankAccounts) {
        items.push(
            <UnlockBankAccount
                key={lockedBankAccount.key}
                bankAccountID={lockedBankAccount.bankAccountID}
                policyName={lockedBankAccount.policyName}
            />,
        );
    }
    // Priority 8: Enter signer info for global bank accounts
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
    // Priority 9: Broken policy connections (accounting + HR)
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
    // Priority 10: Expensify card shipping
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
    // Priority 11: Expensify card activation
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

    const hiddenCount = Math.max(0, items.length - CONST.HOME.SECTION_VISIBLE_LIMIT);
    const visibleItems = isExpanded ? items : items.slice(0, CONST.HOME.SECTION_VISIBLE_LIMIT);

    return (
        <WidgetContainer title={translate('homePage.timeSensitiveSection.title')}>
            <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
                {visibleItems}
                {hiddenCount > 0 && (
                    <HomeSectionExpandToggle
                        isExpanded={isExpanded}
                        onPress={() => setIsExpanded((prev) => !prev)}
                        collapsedLabel={translate('homePage.seeMore', {count: hiddenCount})}
                    />
                )}
            </View>
        </WidgetContainer>
    );
}

export default TimeSensitiveSection;
