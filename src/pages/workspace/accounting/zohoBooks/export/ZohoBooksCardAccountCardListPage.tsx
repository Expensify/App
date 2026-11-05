/**
 * Lists the cards of one company card feed with the Zoho Books account each exports to.
 * A card without its own account falls back to the feed's account, shown as the default. Each card opens the shared card export page.
 */
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
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

type ZohoBooksCardAccountCardListPageProps = WithPolicyConnectionsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.ZOHO_BOOKS_CARD_ACCOUNT_CARD_LIST>;

function ZohoBooksCardAccountCardListPage({
    policy,
    route: {
        params: {feed: feedWithDomainID},
    },
}: ZohoBooksCardAccountCardListPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [cardList] = useCardsList(feedWithDomainID);
    const [cardFeeds] = useCardFeeds(policyID);
    const cardFeed = cardFeeds?.[feedWithDomainID];
    const feedKey = cardFeed?.feed;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const creditCardAccountID = zohoBooksConfig?.export?.creditCardAccountID;
    const cardProgramsUsingCustomAccounts = zohoBooksConfig?.export?.cardProgramAccounts;
    const cardProgramAccountID = (feedKey ? cardProgramsUsingCustomAccounts?.[feedKey] : undefined) ?? creditCardAccountID;
    const cardProgramAccount = zohoBooksData?.bankAccounts?.find((account) => account.id === cardProgramAccountID);
    const hasActiveCards = feedKey && findMatchingCards(cardFeeds ?? {}, {[feedWithDomainID]: cardList}, feedKey).length > 0;
    const title = getCustomOrFormattedFeedName(translate, feedKey, cardFeed?.customFeedName, false);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_CARD_ACCOUNT.getRoute(policyID) : undefined;

    return (
        <ConnectionLayout
            displayName="ZohoBooksCardAccountCardListPage"
            headerTitleAlreadyTranslated={title}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            shouldBeBlocked
            shouldBeForceBlocked={!hasActiveCards}
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.cardAccount.descriptionLevel2')}</Text>
            </View>
            {Object.values(cardList ?? {})
                .filter(isCard)
                .map((card) => {
                    const cardID = card.cardID;
                    const isUsingCustomAccount = typeof card.nameValuePairs === 'object' && CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_ZOHO_BOOKS_EXPORT_ACCOUNT in card.nameValuePairs;
                    const cardAccountID =
                        (typeof card.nameValuePairs === 'object' ? card.nameValuePairs[CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_ZOHO_BOOKS_EXPORT_ACCOUNT] : undefined) ??
                        cardProgramAccount?.id;
                    const cardAccount = zohoBooksData?.bankAccounts?.find((account) => account.id === cardAccountID);
                    const cardAccountDisplayName = cardAccount ? `${cardAccount.name}${isUsingCustomAccount ? '' : ` (${translate('common.default').toLocaleLowerCase()})`}` : '';
                    return (
                        <OfflineWithFeedback
                            key={cardID}
                            pendingAction={getCardsCustomExportPendingAction(
                                cardFeeds ?? {},
                                {[feedWithDomainID]: cardList},
                                CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_ZOHO_BOOKS_EXPORT_ACCOUNT,
                                feedKey,
                                cardID,
                            )}
                        >
                            <MenuItemField
                                name={getCardDescription(card, translate)}
                                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.getRoute(feedWithDomainID, String(cardID))))}
                                value={cardAccountDisplayName}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ZOHO_BOOKS.CARD_ACCOUNT_CARD}
                            >
                                {areCardsCustomExportInErrorFields(
                                    cardFeeds ?? {},
                                    {[feedWithDomainID]: cardList},
                                    CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_ZOHO_BOOKS_EXPORT_ACCOUNT,
                                    feedKey,
                                    cardID,
                                ) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                            </MenuItemField>
                        </OfflineWithFeedback>
                    );
                })}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(ZohoBooksCardAccountCardListPage);
