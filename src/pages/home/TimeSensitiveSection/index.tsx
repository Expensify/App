import {activeAdminPoliciesSelector} from '@selectors/Policy';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import WidgetContainer from '@components/WidgetContainer';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasSynchronizationErrorMessage, isConnectionInProgress} from '@libs/actions/connections';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName, PolicyConnectionName} from '@src/types/onyx/Policy';
import useTimeSensitiveCards from './hooks/useTimeSensitiveCards';
import useTimeSensitiveOffers from './hooks/useTimeSensitiveOffers';
import ActivateCard from './items/ActivateCard';
import AddShippingAddress from './items/AddShippingAddress';
import FixAccountingConnection from './items/FixAccountingConnection';
import FixCompanyCardConnection from './items/FixCompanyCardConnection';
import FixPersonalCardConnection from './items/FixPersonalCardConnection';
import Offer25off from './items/Offer25off';
import Offer50off from './items/Offer50off';
import ReviewCardFraud from './items/ReviewCardFraud';

type BrokenAccountingConnection = {
    /** The policy ID associated with this connection */
    policyID: string;

    /** The policy name associated with this connection */
    policyName: string;

    /** The connection name that has an error */
    connectionName: PolicyConnectionName;
};

type BrokenCompanyCardConnection = {
    /** The policy ID associated with this connection */
    policyID: string;

    /** The policy name associated with this connection */
    policyName: string;

    /** The card ID associated with this connection */
    cardID: string;
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

    // Use custom hooks for offers and cards (Release 3)
    const {shouldShow50off, shouldShow25off, firstDayFreeTrial, discountInfo} = useTimeSensitiveOffers();
    const {shouldShowAddShippingAddress, shouldShowActivateCard, shouldShowReviewCardFraud, cardsNeedingShippingAddress, cardsNeedingActivation, cardsWithFraud} = useTimeSensitiveCards();

    // Selector for filtering admin policies (Release 4)
    const adminPoliciesSelectorWrapper = useCallback((policies: OnyxCollection<Policy>) => activeAdminPoliciesSelector(policies, login ?? ''), [login]);
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: adminPoliciesSelectorWrapper});
    const [connectionSyncProgress] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);

    // Get card feed errors for company card connections (Release 4)
    const cardFeedErrors = useCardFeedErrors();

    // Find policies with broken accounting connections (only for admins)
    const brokenAccountingConnections: BrokenAccountingConnection[] = [];
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
                brokenAccountingConnections.push({
                    policyID: policy.id,
                    policyName: policy.name,
                    connectionName,
                });
            }
        }
    }

    // Get company cards with broken connections (for admins)
    const brokenCompanyCardConnections: BrokenCompanyCardConnection[] = [];
    const cardsWithBrokenConnection = cardFeedErrors.cardsWithBrokenFeedConnection;
    if (cardsWithBrokenConnection && adminPolicies) {
        for (const card of Object.values(cardsWithBrokenConnection)) {
            if (!card?.fundID) {
                continue;
            }

            // Find the policy associated with this card's fundID (workspaceAccountID)
            const cardFundID = Number(card.fundID);
            const matchingPolicy = adminPolicies.find((policy) => policy.workspaceAccountID === cardFundID);

            if (!matchingPolicy) {
                continue;
            }

            brokenCompanyCardConnections.push({
                policyID: matchingPolicy.id,
                policyName: matchingPolicy.name,
                cardID: String(card.cardID),
            });
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
    const hasBrokenAccountingConnections = brokenAccountingConnections.length > 0;
    // This guard must exactly match the conditions used to render each widget below.
    // If a widget has additional conditions in the render (e.g. && !!discountInfo), those
    // must be reflected here to avoid showing an empty "Time sensitive" section.
    const hasAnyTimeSensitiveContent =
        shouldShowReviewCardFraud ||
        shouldShow50off ||
        (shouldShow25off && !!discountInfo) ||
        hasBrokenCompanyCards ||
        hasBrokenPersonalCards ||
        hasBrokenAccountingConnections ||
        shouldShowAddShippingAddress ||
        shouldShowActivateCard;

    if (!hasAnyTimeSensitiveContent) {
        return null;
    }

    // Priority order:
    // 1. Potential card fraud
    // 2. Broken bank connections (company cards)
    // 3. Broken bank connections (personal cards)
    // 4. Broken accounting connections
    // 5. Early adoption discount (50% or 25%)
    // 6. Expensify card shipping
    // 7. Expensify card activation
    return (
        <WidgetContainer title={translate('homePage.timeSensitiveSection.title')}>
            <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
                {/* Priority 1: Card fraud alerts */}
                {shouldShowReviewCardFraud &&
                    cardsWithFraud.map((card) => {
                        if (!card.nameValuePairs?.possibleFraud) {
                            return null;
                        }
                        return (
                            <ReviewCardFraud
                                key={card.cardID}
                                possibleFraud={card.nameValuePairs.possibleFraud}
                            />
                        );
                    })}

                {/* Priority 2: Broken company card connections */}
                {brokenCompanyCardConnections.map((connection) => {
                    const card = cardFeedErrors.cardsWithBrokenFeedConnection[connection.cardID];
                    if (!card) {
                        return null;
                    }
                    return (
                        <FixCompanyCardConnection
                            key={`card-${connection.cardID}`}
                            card={card}
                            policyID={connection.policyID}
                            policyName={connection.policyName}
                        />
                    );
                })}

                {/* Priority 3: Broken personal card connections */}
                {brokenPersonalCardConnections.map((connection) => {
                    const card = cardFeedErrors.personalCardsWithBrokenConnection[connection.cardID];
                    if (!card) {
                        return null;
                    }
                    return (
                        <FixPersonalCardConnection
                            key={`card-${connection.cardID}`}
                            card={card}
                        />
                    );
                })}

                {/* Priority 4: Broken accounting connections */}
                {brokenAccountingConnections.map((connection) => (
                    <FixAccountingConnection
                        key={`accounting-${connection.policyID}-${connection.connectionName}`}
                        connectionName={connection.connectionName}
                        policyID={connection.policyID}
                        policyName={connection.policyName}
                    />
                ))}

                {/* Priority 5: Early adoption discount offers */}
                {shouldShow50off && <Offer50off firstDayFreeTrial={firstDayFreeTrial} />}
                {shouldShow25off && !!discountInfo && <Offer25off days={discountInfo.days} />}

                {/* Priority 6: Expensify card shipping */}
                {shouldShowAddShippingAddress &&
                    cardsNeedingShippingAddress.map((card) => (
                        <AddShippingAddress
                            key={card.cardID}
                            card={card}
                        />
                    ))}

                {/* Priority 7: Expensify card activation */}
                {shouldShowActivateCard &&
                    cardsNeedingActivation.map((card) => (
                        <ActivateCard
                            key={card.cardID}
                            card={card}
                        />
                    ))}
            </View>
        </WidgetContainer>
    );
}

export default TimeSensitiveSection;
