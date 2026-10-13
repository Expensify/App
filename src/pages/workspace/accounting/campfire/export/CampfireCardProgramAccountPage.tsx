import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
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

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function CampfireCardProgramAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardLists] = useCardsLists();
    const campfireConfig = policy?.connections?.campfire?.config;
    const campfireData = policy?.connections?.campfire?.data;
    const creditCardAccountID = campfireConfig?.export?.creditCardAccountID;
    const cardProgramsUsingCustomAccounts = campfireConfig?.export?.cardProgramAccounts;
    const cardsUsingCustomAccountsCount = getCardsUsingCustomExportCount(cardFeeds ?? {}, cardLists, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_CAMPFIRE_EXPORT_ACCOUNT);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXPORT.getRoute(policyID) : undefined;

    return (
        <ConnectionLayout
            displayName="CampfireCardProgramAccountPage"
            headerTitle="workspace.campfire.cardProgramAccount.label"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.campfire.cardProgramAccount.description')}</Text>
            </View>
            {Object.values(cardFeeds ?? {})
                .filter((cardFeed) => findMatchingCards(cardFeeds ?? {}, cardLists, cardFeed.feed).length > 0)
                .map((cardFeed) => {
                    const feedKey = cardFeed.feed;
                    const feedName = getCustomOrFormattedFeedName(translate, feedKey, cardFeed.customFeedName, false);
                    const feedDomainID = cardFeed.domainID ?? CONST.DEFAULT_MISSING_ID;
                    const feedWithDomainID = getCardFeedWithDomainID(feedKey, feedDomainID);
                    const isUsingCustomAccount = !!cardProgramsUsingCustomAccounts?.[feedKey];
                    const cardProgramAccountID = cardProgramsUsingCustomAccounts?.[feedKey] ?? creditCardAccountID;
                    const cardProgramAccount = campfireData?.accounts?.find((account) => account.id === cardProgramAccountID);
                    const cardProgramAccountDisplayName = cardProgramAccount
                        ? `${cardProgramAccount.id} ${cardProgramAccount.name}${isUsingCustomAccount ? '' : ` (${translate('common.default').toLocaleLowerCase()})`}`
                        : '';
                    return (
                        <OfflineWithFeedback
                            key={feedKey}
                            pendingAction={settingsPendingAction([`${CONST.CAMPFIRE_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], campfireConfig?.pendingFields)}
                        >
                            <MenuItem.Root
                                onPress={callFunctionIfActionIsAllowed(() =>
                                    policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_CARD_PROGRAM_ACCOUNT_SELECTOR.getRoute(policyID, feedWithDomainID)) : undefined,
                                )}
                            >
                                <MenuItemField.Row
                                    name={feedName ?? ''}
                                    value={cardProgramAccountDisplayName}
                                >
                                    {areSettingsInErrorFields([`${CONST.CAMPFIRE_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], campfireConfig?.errorFields) && (
                                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                    )}
                                    <MenuItem.Chevron />
                                </MenuItemField.Row>
                                {!!cardsUsingCustomAccountsCount.perFeedCount[feedKey] && (
                                    <MenuItem.HelpText message={translate('workspace.campfire.cardAccount.countInfo', cardsUsingCustomAccountsCount.perFeedCount[feedKey])} />
                                )}
                            </MenuItem.Root>
                        </OfflineWithFeedback>
                    );
                })}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(CampfireCardProgramAccountPage);
