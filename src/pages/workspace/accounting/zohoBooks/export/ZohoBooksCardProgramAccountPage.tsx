/**
 * Lists each company card feed that has active cards, with the Zoho Books account its expenses export to.
 * A feed without its own account falls back to the workspace company card account, shown as the default.
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

import {findMatchingCards, getCardsUsingCustomExportCount} from '@libs/CardFeedUtils';
import {getCardFeedWithDomainID, getCustomOrFormattedFeedName} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';

function ZohoBooksCardProgramAccountPage({policy}: WithPolicyConnectionsProps) {
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
            displayName="ZohoBooksCardProgramAccountPage"
            headerTitle="workspace.zohoBooks.cardProgramAccount.label"
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
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.cardProgramAccount.description')}</Text>
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
                    const cardProgramAccount = zohoBooksData?.bankAccounts?.find((account) => account.id === cardProgramAccountID);
                    const cardProgramAccountDisplayName = cardProgramAccount
                        ? `${cardProgramAccount.name}${isUsingCustomAccount ? '' : ` (${translate('common.default').toLocaleLowerCase()})`}`
                        : '';
                    return (
                        <OfflineWithFeedback
                            key={feedWithDomainID}
                            pendingAction={settingsPendingAction([`${CONST.ZOHO_BOOKS_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], zohoBooksConfig?.pendingFields)}
                        >
                            <MenuItem.Root
                                onPress={callFunctionIfActionIsAllowed(
                                    () =>
                                        policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_CARD_PROGRAM_ACCOUNT_SELECTOR.getRoute(policyID, feedWithDomainID)) : undefined,
                                    false,
                                    session,
                                )}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ZOHO_BOOKS.CARD_PROGRAM_ACCOUNT_FEED}
                            >
                                <MenuItemField.Row
                                    name={feedName ?? ''}
                                    value={cardProgramAccountDisplayName}
                                >
                                    {areSettingsInErrorFields([`${CONST.ZOHO_BOOKS_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], zohoBooksConfig?.errorFields) && (
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

export default withPolicyConnections(ZohoBooksCardProgramAccountPage);
