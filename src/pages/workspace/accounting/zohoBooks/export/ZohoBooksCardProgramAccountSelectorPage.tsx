/**
 * Lets an admin pick the Zoho Books account one company card feed exports to.
 * Picking the workspace company card account clears the feed's own account, so the feed follows the default again.
 */
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

import {clearZohoBooksErrorField, updateZohoBooksCardProgramAccount} from '@libs/actions/connections/ZohoBooks';
import {findMatchingCards} from '@libs/CardFeedUtils';
import {getCustomOrFormattedFeedName} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {clearTrailingDefaultSeparator, sortDefaultToTop} from '@libs/ListUtils';
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
import type {ZohoBooksBankAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: ZohoBooksBankAccount['id'];
};

type ZohoBooksCardProgramAccountSelectorPageProps = WithPolicyConnectionsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.ZOHO_BOOKS_CARD_PROGRAM_ACCOUNT_SELECTOR>;

function ZohoBooksCardProgramAccountSelectorPage({
    policy,
    route: {
        params: {feed: feedWithDomainID},
    },
}: ZohoBooksCardProgramAccountSelectorPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const cardFeed = cardFeeds?.[feedWithDomainID];
    const [cardLists] = useCardsLists();
    const feedKey = cardFeed?.feed;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const creditCardAccountID = zohoBooksConfig?.export?.creditCardAccountID;
    const cardProgramsUsingCustomAccounts = zohoBooksConfig?.export?.cardProgramAccounts;
    const cardProgramAccountID = (feedKey ? cardProgramsUsingCustomAccounts?.[feedKey] : undefined) ?? creditCardAccountID;
    const hasActiveCards = feedKey && findMatchingCards(cardFeeds ?? {}, cardLists, feedKey).length > 0;
    const title = getCustomOrFormattedFeedName(translate, feedKey, cardFeed?.customFeedName, false);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_CARD_PROGRAM_ACCOUNT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        zohoBooksData?.bankAccounts
            ?.filter(
                (accountItem) =>
                    accountItem.isActive && (accountItem.accountType === CONST.ZOHO_BOOKS_ACCOUNT_TYPE.BANK || accountItem.accountType === CONST.ZOHO_BOOKS_ACCOUNT_TYPE.CREDIT_CARD),
            )
            .map((accountItem) => ({
                value: accountItem.id,
                text: `${creditCardAccountID === accountItem.id ? `${translate('common.default')} - ` : ''}${accountItem.name}`,
                keyForList: accountItem.id,
                isSelected: cardProgramAccountID === accountItem.id,
            })) ?? [];
    // Sort the default account to the top first, then let useSelectionListSearch pin the selected account above it,
    // so the currently selected account stays at the very top.
    const sortedData = sortDefaultToTop(data, (accountItem) => creditCardAccountID === accountItem.keyForList, styles);
    const {filteredData: pinnedData, textInputOptions} = useSelectionListSearch(sortedData);
    const filteredData = clearTrailingDefaultSeparator(pinnedData, (accountItem) => creditCardAccountID === accountItem.keyForList);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.cardProgramAccount.descriptionLevel2')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.zohoBooks.noAccountsFound')}
            subtitle={translate('workspace.zohoBooks.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectCardProgramAccount = (item: AccountListItem) => {
        if (item.value !== cardProgramAccountID && policyID && feedKey) {
            // Choosing the default account clears the custom account
            const value = item.value === creditCardAccountID ? '' : item.value;
            const oldValue = cardProgramAccountID === creditCardAccountID ? undefined : cardProgramAccountID;
            updateZohoBooksCardProgramAccount(policyID, feedKey, value, oldValue);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="ZohoBooksCardProgramAccountSelectorPage"
            headerTitleAlreadyTranslated={title}
            data={filteredData}
            textInputOptions={textInputOptions}
            shouldBeBlocked={!hasActiveCards}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            onSelectRow={selectCardProgramAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={cardProgramAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            pendingAction={settingsPendingAction([`${CONST.ZOHO_BOOKS_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig, `${CONST.ZOHO_BOOKS_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearZohoBooksErrorField(policyID, `${CONST.ZOHO_BOOKS_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`)}
        />
    );
}

export default withPolicyConnections(ZohoBooksCardProgramAccountSelectorPage);
