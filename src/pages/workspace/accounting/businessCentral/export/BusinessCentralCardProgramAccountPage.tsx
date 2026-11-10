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

function BusinessCentralCardProgramAccountPage({policy}: WithPolicyConnectionsProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardLists] = useCardsLists();
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const businessCentralData = policy?.connections?.businessCentral?.data;
    const companyCardAccountID = businessCentralConfig?.export?.nonReimbursableAccount;
    const cardProgramsUsingCustomAccounts = businessCentralConfig?.export?.cardProgramAccounts;
    const cardsUsingCustomAccountsCount = getCardsUsingCustomExportCount(cardFeeds ?? {}, cardLists, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_BUSINESS_CENTRAL_EXPORT_ACCOUNT);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(policyID) : undefined;

    return (
        <ConnectionLayout
            displayName="BusinessCentralCardProgramAccountPage"
            headerTitle="workspace.businessCentral.cardProgramAccount.label"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.cardProgramAccount.description')}</Text>
            </View>
            {Object.values(cardFeeds ?? {})
                .filter((cardFeed) => findMatchingCards(cardFeeds ?? {}, cardLists, cardFeed.feed).length > 0)
                .map((cardFeed) => {
                    const feedKey = cardFeed.feed;
                    const feedName = getCustomOrFormattedFeedName(translate, feedKey, cardFeed.customFeedName, false);
                    const feedDomainID = cardFeed.domainID ?? CONST.DEFAULT_MISSING_ID;
                    const feedWithDomainID = getCardFeedWithDomainID(feedKey, feedDomainID);
                    const pendingField = `${CONST.BUSINESS_CENTRAL_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`;
                    const isUsingCustomAccount = !!cardProgramsUsingCustomAccounts?.[feedKey];
                    const cardProgramAccountID = cardProgramsUsingCustomAccounts?.[feedKey] ?? companyCardAccountID;
                    const cardProgramAccount = businessCentralData?.bankAccounts?.find((bankAccount) => bankAccount.id === cardProgramAccountID);
                    const cardProgramAccountDisplayName = cardProgramAccount
                        ? `${cardProgramAccount.number} ${cardProgramAccount.name}${isUsingCustomAccount ? '' : ` (${translate('common.default').toLocaleLowerCase()})`}`
                        : '';
                    return (
                        <OfflineWithFeedback
                            key={feedKey}
                            pendingAction={settingsPendingAction([pendingField], businessCentralConfig?.pendingFields)}
                        >
                            <MenuItem.Root
                                onPress={callFunctionIfActionIsAllowed(
                                    () =>
                                        policyID
                                            ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_CARD_PROGRAM_ACCOUNT_SELECTOR.getRoute(policyID, feedWithDomainID))
                                            : undefined,
                                    false,
                                    session,
                                )}
                            >
                                <MenuItemField.Row
                                    name={feedName ?? ''}
                                    value={cardProgramAccountDisplayName}
                                >
                                    {areSettingsInErrorFields([pendingField], businessCentralConfig?.errorFields) && (
                                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                    )}
                                    <MenuItem.Chevron />
                                </MenuItemField.Row>
                                {!!cardsUsingCustomAccountsCount.perFeedCount[feedKey] && (
                                    <MenuItem.HelpText message={translate('workspace.businessCentral.cardAccount.countInfo', {count: cardsUsingCustomAccountsCount.perFeedCount[feedKey]})} />
                                )}
                            </MenuItem.Root>
                        </OfflineWithFeedback>
                    );
                })}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(BusinessCentralCardProgramAccountPage);
