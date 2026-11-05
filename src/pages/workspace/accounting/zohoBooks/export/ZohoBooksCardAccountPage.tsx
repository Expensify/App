/**
 * Lists each company card feed that has active cards, with the Zoho Books account its cards export to by default.
 * Opening a feed lists its cards so an admin can override the account per card.
 */
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsLists from '@hooks/useCardsLists';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {areCardsCustomExportInErrorFields, findMatchingCards, getCardsCustomExportPendingAction, getCardsUsingCustomExportCount} from '@libs/CardFeedUtils';
import {getCardFeedWithDomainID, getCustomOrFormattedFeedName} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';

function ZohoBooksCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardLists] = useCardsLists();
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const creditCardAccountID = zohoBooksConfig?.export?.creditCardAccountID;
    const cardProgramsUsingCustomAccounts = zohoBooksConfig?.export?.cardProgramAccounts;
    const cardsUsingCustomAccountsCount = getCardsUsingCustomExportCount(cardFeeds ?? {}, cardLists, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_ZOHO_BOOKS_EXPORT_ACCOUNT);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_EXPORT.getRoute(policyID) : undefined;

    return (
        <ConnectionLayout
            displayName="ZohoBooksCardAccountPage"
            headerTitle="workspace.zohoBooks.cardAccount.label"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.cardAccount.description')}</Text>
            </View>
            {Object.values(cardFeeds ?? {})
                .filter((cardFeed) => findMatchingCards(cardFeeds ?? {}, cardLists, cardFeed.feed).length > 0)
                .map((cardFeed) => {
                    const feedKey = cardFeed.feed;
                    const feedName = getCustomOrFormattedFeedName(translate, feedKey, cardFeed.customFeedName, false);
                    const feedDomainID = cardFeed.domainID ?? CONST.DEFAULT_MISSING_ID;
                    const feedWithDomainID = getCardFeedWithDomainID(feedKey, feedDomainID);
                    const cardProgramAccountID = cardProgramsUsingCustomAccounts?.[feedKey] ?? creditCardAccountID;
                    const isUsingDefaultAccount = cardProgramAccountID === creditCardAccountID;
                    const cardProgramAccount = zohoBooksData?.bankAccounts?.find((account) => account.id === cardProgramAccountID);
                    const cardProgramAccountDisplayName = cardProgramAccount
                        ? `${cardProgramAccount.name}${isUsingDefaultAccount ? ` (${translate('common.default').toLocaleLowerCase()})` : ''}`
                        : '';
                    return (
                        <OfflineWithFeedback
                            key={feedWithDomainID}
                            pendingAction={getCardsCustomExportPendingAction(cardFeeds ?? {}, cardLists ?? {}, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_ZOHO_BOOKS_EXPORT_ACCOUNT, feedKey)}
                        >
                            <MenuItem.Root
                                onPress={callFunctionIfActionIsAllowed(
                                    () => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_CARD_ACCOUNT_CARD_LIST.getRoute(policyID, feedWithDomainID)) : undefined),
                                    false,
                                    session,
                                )}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ZOHO_BOOKS.CARD_ACCOUNT_FEED}
                            >
                                <MenuItemField.Row
                                    name={feedName ?? ''}
                                    value={cardProgramAccountDisplayName}
                                >
                                    {areCardsCustomExportInErrorFields(cardFeeds ?? {}, cardLists ?? {}, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_ZOHO_BOOKS_EXPORT_ACCOUNT, feedKey) && (
                                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                    )}
                                    <MenuItem.Chevron />
                                </MenuItemField.Row>
                                {!!cardsUsingCustomAccountsCount.perFeedCount[feedKey] && (
                                    <MenuItem.HelpText message={translate('workspace.zohoBooks.cardAccount.countInfo', {count: cardsUsingCustomAccountsCount.perFeedCount[feedKey]})} />
                                )}
                            </MenuItem.Root>
                        </OfflineWithFeedback>
                    );
                })}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(ZohoBooksCardAccountPage);
