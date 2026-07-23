import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsLists from '@hooks/useCardsLists';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {findMatchingCards, getCardsUsingCustomExportCount} from '@libs/CardFeedUtils';
import {getCardFeedWithDomainID, getCustomOrFormattedFeedName} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function RilletCardProgramAccount({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardLists] = useCardsLists();
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const creditCardAccountCode = rilletConfig?.export?.creditCardAccountCode;
    const cardProgramsUsingCustomAccounts = rilletConfig?.export?.cardProgramAccounts;
    const cardsUsingCustomAccountsCount = getCardsUsingCustomExportCount(cardFeeds ?? {}, cardLists, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(policyID) : undefined;

    return (
        <ConnectionLayout
            displayName="RilletCardProgramAccount"
            headerTitle="workspace.rillet.cardProgramAccount.label"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.cardProgramAccount.description')}</Text>
            </View>
            {Object.values(cardFeeds ?? {})
                .filter((cardFeed) => findMatchingCards(cardFeeds ?? {}, cardLists, cardFeed.feed).length > 0)
                .map((cardFeed) => {
                    const feedKey = cardFeed.feed;
                    const feedName = getCustomOrFormattedFeedName(translate, feedKey, cardFeed.customFeedName, false);
                    const feedDomainID = cardFeed.domainID ?? CONST.DEFAULT_MISSING_ID;
                    const feedWithDomainID = getCardFeedWithDomainID(feedKey, feedDomainID);
                    const isUsingCustomAccount = !!cardProgramsUsingCustomAccounts?.[feedKey];
                    const cardProgramAccountCode = cardProgramsUsingCustomAccounts?.[feedKey] ?? creditCardAccountCode;
                    const cardProgramAccount = rilletData?.accounts?.find((account) => account.code === cardProgramAccountCode);
                    const cardProgramAccountDisplayName = cardProgramAccount
                        ? `${cardProgramAccount.code} ${cardProgramAccount.name}${isUsingCustomAccount ? '' : ` (${translate('common.default').toLocaleLowerCase()})`}`
                        : '';
                    return (
                        <OfflineWithFeedback
                            key={feedKey}
                            pendingAction={settingsPendingAction([`${CONST.RILLET_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], rilletConfig?.pendingFields)}
                        >
                            <MenuItemWithTopDescription
                                title={cardProgramAccountDisplayName}
                                description={feedName}
                                hintText={
                                    cardsUsingCustomAccountsCount.perFeedCount[feedKey]
                                        ? translate('workspace.rillet.cardAccount.countInfo', cardsUsingCustomAccountsCount.perFeedCount[feedKey])
                                        : undefined
                                }
                                onPress={() =>
                                    policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_CARD_PROGRAM_ACCOUNT_SELECTOR.getRoute(policyID, feedWithDomainID)) : undefined
                                }
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([`${CONST.RILLET_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], rilletConfig?.errorFields)
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

export default withPolicyConnections(RilletCardProgramAccount);
