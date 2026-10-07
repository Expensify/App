import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsLists from '@hooks/useCardsLists';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearCampfireErrorField, updateCampfireCardProgramAccount} from '@libs/actions/connections/Campfire';
import {findMatchingCards} from '@libs/CardFeedUtils';
import {getCustomOrFormattedFeedName} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {sortDefaultToTop} from '@libs/ListUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CampfireAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: CampfireAccount['id'];
};

type CampfireCardProgramAccountSelectorPageProps = WithPolicyConnectionsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CAMPFIRE_CARD_PROGRAM_ACCOUNT_SELECTOR>;

function CampfireCardProgramAccountSelectorPage({
    policy,
    route: {
        params: {feed: feedWithDomainID},
    },
}: CampfireCardProgramAccountSelectorPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const cardFeed = cardFeeds?.[feedWithDomainID];
    const [cardLists] = useCardsLists();
    const feedKey = cardFeed?.feed;
    const campfireConfig = policy?.connections?.campfire?.config;
    const campfireData = policy?.connections?.campfire?.data;
    const creditCardAccountID = campfireConfig?.export?.creditCardAccountID;
    const cardProgramsUsingCustomAccounts = campfireConfig?.export?.cardProgramAccounts;
    const cardProgramAccountID = (feedKey ? cardProgramsUsingCustomAccounts?.[feedKey] : undefined) ?? creditCardAccountID;
    const hasActiveCards = feedKey && findMatchingCards(cardFeeds ?? {}, cardLists, feedKey).length > 0;
    const title = getCustomOrFormattedFeedName(translate, feedKey, cardFeed?.customFeedName, false);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_CAMPFIRE_CARD_PROGRAM_ACCOUNT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        campfireData?.accounts
            ?.filter(
                (accountItem) =>
                    accountItem.isActive && (accountItem.accountSubtype === CONST.CAMPFIRE_ACCOUNT_SUBTYPE.CREDIT_CARD || accountItem.accountSubtype === CONST.CAMPFIRE_ACCOUNT_SUBTYPE.BANK),
            )
            .map((accountItem) => ({
                value: accountItem.id,
                text: `${creditCardAccountID === accountItem.id ? `${translate('common.default')} - ` : ''}${accountItem.id} ${accountItem.name}`,
                keyForList: accountItem.id,
                isSelected: cardProgramAccountID === accountItem.id,
            })) ?? [];
    // Sort the default account to the top first, then let useSelectionListSearch pin the selected account above it,
    // so the currently selected account stays at the very top.
    const sortedData = sortDefaultToTop(data, (accountItem) => creditCardAccountID === accountItem.keyForList, styles);
    const {filteredData, textInputOptions} = useSelectionListSearch(sortedData);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.campfire.cardProgramAccount.descriptionLevel2')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.campfire.noAccountsFound')}
            subtitle={translate('workspace.campfire.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectCreditCardAccount = (item: AccountListItem) => {
        if (item.value !== cardProgramAccountID && policyID && feedKey) {
            // Choosing the default account clears the custom account
            const value = item.value === creditCardAccountID ? '' : item.value;
            const oldValue = cardProgramAccountID === creditCardAccountID ? undefined : cardProgramAccountID;
            updateCampfireCardProgramAccount(policyID, feedKey, value, oldValue);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CampfireCardProgramAccountSelectorPage"
            headerTitleAlreadyTranslated={title}
            data={filteredData}
            textInputOptions={textInputOptions}
            shouldBeBlocked={!hasActiveCards}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectCreditCardAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={cardProgramAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            pendingAction={settingsPendingAction([`${CONST.CAMPFIRE_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], campfireConfig?.pendingFields)}
            errors={getLatestErrorField(campfireConfig, `${CONST.CAMPFIRE_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearCampfireErrorField(policyID, `${CONST.CAMPFIRE_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`)}
        />
    );
}

export default withPolicyConnections(CampfireCardProgramAccountSelectorPage);
