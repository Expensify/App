import {activeAdminPoliciesSelector} from '@selectors/Policy';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import WidgetContainer from '@components/WidgetContainer';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasSynchronizationErrorMessage, isConnectionInProgress} from '@libs/actions/connections';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName, PolicyConnectionName} from '@src/types/onyx/Policy';
import useTimeSensitiveCards from './hooks/useTimeSensitiveCards';
import useTimeSensitiveOffers from './hooks/useTimeSensitiveOffers';
import ActivateCard from './items/ActivateCard';
import AddShippingAddress from './items/AddShippingAddress';
import FixAccountingConnection from './items/FixAccountingConnection';
import FixCompanyCardConnection from './items/FixCompanyCardConnection';
import Offer25off from './items/Offer25off';
import Offer50off from './items/Offer50off';

type BrokenAccountingConnection = {
    /** The policy ID associated with this connection */
    policyID: string;

    /** The connection name that has an error */
    connectionName: PolicyConnectionName;
};

type BrokenCompanyCardConnection = {
    /** The policy ID associated with this connection */
    policyID: string;

    /** The card ID associated with this connection */
    cardID: string;
};

function TimeSensitiveSection() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {login} = useCurrentUserPersonalDetails();

    // Use custom hooks for offers and cards (Release 3)
    const {shouldShow50off, shouldShow25off, firstDayFreeTrial, discountInfo} = useTimeSensitiveOffers();
    const {shouldShowAddShippingAddress, shouldShowActivateCard, cardsNeedingShippingAddress, cardsNeedingActivation} = useTimeSensitiveCards();

    // Selector for filtering admin policies (Release 4)
    const adminPoliciesSelectorWrapper = useCallback((policies: OnyxCollection<Policy>) => activeAdminPoliciesSelector(policies, login ?? ''), [login]);
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true, selector: adminPoliciesSelectorWrapper});
    const [connectionSyncProgress] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS, {canBeMissing: true});

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
            const matchingPolicy = adminPolicies.find((policy) => policy.workspaceAccountID === Number(card.fundID));

            if (!matchingPolicy) {
                continue;
            }

            brokenCompanyCardConnections.push({
                policyID: matchingPolicy.id,
                cardID: String(card.cardID),
            });
        }
    }

    const hasBrokenCompanyCards = brokenCompanyCardConnections.length > 0;
    const hasBrokenAccountingConnections = brokenAccountingConnections.length > 0;
    const hasAnyTimeSensitiveContent =
        shouldShow50off || shouldShow25off || hasBrokenCompanyCards || hasBrokenAccountingConnections || shouldShowAddShippingAddress || shouldShowActivateCard;

    if (!hasAnyTimeSensitiveContent) {
        return null;
    }

    // Priority order:
    // 1. Potential card fraud ( not implemented here)
    // 2. Broken bank connections (company cards)
    // 3. Broken accounting connections
    // 4. Early adoption discount (50% or 25%)
    // 5. Expensify card shipping
    // 6. Expensify card activation
    return (
        <WidgetContainer
            icon={icons.Stopwatch}
            iconWidth={variables.iconSizeNormal}
            iconHeight={variables.iconSizeNormal}
            iconFill={theme.danger}
            title={translate('homePage.timeSensitiveSection.title')}
            titleColor={theme.danger}
        >
            <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
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
                        />
                    );
                })}

                {/* Priority 3: Broken accounting connections */}
                {brokenAccountingConnections.map((connection) => (
                    <FixAccountingConnection
                        key={`accounting-${connection.policyID}-${connection.connectionName}`}
                        connectionName={connection.connectionName}
                        policyID={connection.policyID}
                    />
                ))}

                {/* Priority 4: Early adoption discount offers */}
                {shouldShow50off && <Offer50off firstDayFreeTrial={firstDayFreeTrial} />}
                {shouldShow25off && !!discountInfo && <Offer25off days={discountInfo.days} />}

                {/* Priority 5: Expensify card shipping */}
                {shouldShowAddShippingAddress &&
                    cardsNeedingShippingAddress.map((card) => (
                        <AddShippingAddress
                            key={card.cardID}
                            card={card}
                        />
                    ))}

                {/* Priority 6: Expensify card activation */}
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
