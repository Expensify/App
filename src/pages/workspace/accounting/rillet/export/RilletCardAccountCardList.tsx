import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {areCardsCustomExportInErrorFields, getCardsCustomExportPendingAction, getCardsUsingCustomExportCount} from '@libs/CardFeedUtils';
import {getCardDescription, getCustomOrFormattedFeedName, splitCardFeedWithDomainID} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {appendParam} from '@libs/Url';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Card, CardFeed, CardFeedWithDomainID} from '@src/types/onyx';

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
    const feedKey = splitCardFeedWithDomainID(feedWithDomainID)?.feedName as CardFeed;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const creditCardAccountCode = rilletConfig?.export?.creditCardAccountCode;
    const cardProgramsUsingCustomAccounts = rilletConfig?.export?.cardProgramAccounts;
    const cardProgramAccountCode = cardProgramsUsingCustomAccounts?.[feedKey] ?? creditCardAccountCode;
    const title = getCustomOrFormattedFeedName(translate, feedKey, cardFeed?.customFeedName, false);

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
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.cardAccount.descriptionLevel2')}</Text>
            </View>
            {Object.values(cardList ?? {}).map((card) => {
                const cardID = Number(card.cardID);
                const isUsingCustomAccount = typeof card.nameValuePairs === 'object' && CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT in card.nameValuePairs;
                const cardAccountCode =
                    (typeof card.nameValuePairs === 'object' ? card.nameValuePairs[CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT] : undefined) ?? cardProgramAccountCode;
                const cardAccount = rilletData?.accounts?.find((account) => account.code === cardAccountCode);
                const cardAccountDisplayName = cardAccount
                    ? `${cardAccount.code} ${cardAccount.name}${isUsingCustomAccount ? '' : ` (${translate('common.default').toLocaleLowerCase()})`}`
                    : '';
                return (
                    <OfflineWithFeedback
                        key={feedKey}
                        pendingAction={getCardsCustomExportPendingAction(
                            cardFeeds ?? {},
                            {feedWithDomainID: cardList},
                            CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT,
                            feedKey,
                            cardID,
                        )}
                    >
                        <MenuItemWithTopDescription
                            title={cardAccountDisplayName}
                            description={getCardDescription(card as Card, translate)}
                            onPress={() => Navigation.navigate(appendParam(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.path), 'cardID', cardID.toString()))}
                            shouldShowRightIcon
                            brickRoadIndicator={
                                areCardsCustomExportInErrorFields(
                                    cardFeeds ?? {},
                                    {feedWithDomainID: cardList},
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
