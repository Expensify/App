import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {areCardsCustomExportInErrorFields, findMatchingCards, getCardsCustomExportPendingAction} from '@libs/CardFeedUtils';
import {getCardDescription, getCustomOrFormattedFeedName, isCard} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type RilletCardAccountCardListProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RILLET_CARD_ACCOUNT_CARD_LIST>;

function RilletCardAccountCardList({
    policy,
    route: {
        params: {feed: feedWithDomainID},
    },
}: RilletCardAccountCardListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [cardList] = useCardsList(feedWithDomainID);
    const [cardFeeds] = useCardFeeds(policyID);
    const cardFeed = cardFeeds?.[feedWithDomainID];
    const feedKey = cardFeed?.feed;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const creditCardAccountCode = rilletConfig?.export?.creditCardAccountCode;
    const cardProgramsUsingCustomAccounts = rilletConfig?.export?.cardProgramAccounts;
    const cardProgramAccountCode = (feedKey ? cardProgramsUsingCustomAccounts?.[feedKey] : undefined) ?? creditCardAccountCode;
    const cardProgramAccount = rilletData?.accounts?.find((account) => account.code === cardProgramAccountCode);
    const hasActiveCards = feedKey && findMatchingCards(cardFeeds ?? {}, {[feedWithDomainID]: cardList}, feedKey).length > 0;
    const title = getCustomOrFormattedFeedName(translate, feedKey, cardFeed?.customFeedName, false);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_CARD_ACCOUNT.getRoute(policyID) : undefined;

    return (
        <ConnectionLayout
            displayName="RilletCardAccountCardList"
            headerTitleAlreadyTranslated={title}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            shouldBeBlocked
            shouldBeForceBlocked={!hasActiveCards}
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.cardAccount.descriptionLevel2')}</Text>
            </View>
            {Object.values(cardList ?? {})
                .filter(isCard)
                .map((card) => {
                    const cardID = card.cardID;
                    const isUsingCustomAccount = typeof card.nameValuePairs === 'object' && CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT in card.nameValuePairs;
                    const cardAccountID =
                        (typeof card.nameValuePairs === 'object' ? card.nameValuePairs[CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT] : undefined) ??
                        cardProgramAccount?.id;
                    const cardAccount = rilletData?.accounts?.find((account) => account.id === cardAccountID);
                    const cardAccountDisplayName = cardAccount
                        ? `${cardAccount.code} ${cardAccount.name}${isUsingCustomAccount ? '' : ` (${translate('common.default').toLocaleLowerCase()})`}`
                        : '';
                    return (
                        <OfflineWithFeedback
                            key={cardID}
                            pendingAction={getCardsCustomExportPendingAction(
                                cardFeeds ?? {},
                                {[feedWithDomainID]: cardList},
                                CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT,
                                feedKey,
                                cardID,
                            )}
                        >
                            <MenuItemWithTopDescription
                                title={cardAccountDisplayName}
                                description={getCardDescription(card, translate)}
                                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.getRoute(String(cardID))))}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areCardsCustomExportInErrorFields(
                                        cardFeeds ?? {},
                                        {[feedWithDomainID]: cardList},
                                        CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT,
                                        feedKey,
                                        cardID,
                                    )
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                    );
                })}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(RilletCardAccountCardList);
