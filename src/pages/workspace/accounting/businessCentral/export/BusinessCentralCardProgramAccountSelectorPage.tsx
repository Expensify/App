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

import {clearBusinessCentralErrorField, updateBusinessCentralCardProgramAccount} from '@libs/actions/connections/BusinessCentral';
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
import type {BusinessCentralBankAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: BusinessCentralBankAccount['id'];
};

type BusinessCentralCardProgramAccountSelectorPageProps = WithPolicyConnectionsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_CARD_PROGRAM_ACCOUNT_SELECTOR>;

function BusinessCentralCardProgramAccountSelectorPage({
    policy,
    route: {
        params: {feed: feedWithDomainID},
    },
}: BusinessCentralCardProgramAccountSelectorPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const cardFeed = cardFeeds?.[feedWithDomainID];
    const [cardLists] = useCardsLists();
    const feedKey = cardFeed?.feed;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const businessCentralData = policy?.connections?.businessCentral?.data;
    const companyCardAccountID = businessCentralConfig?.export?.nonReimbursableAccount;
    const cardProgramsUsingCustomAccounts = businessCentralConfig?.export?.cardProgramAccounts;
    const cardProgramAccountID = (feedKey ? cardProgramsUsingCustomAccounts?.[feedKey] : undefined) ?? companyCardAccountID;
    const hasActiveCards = feedKey && findMatchingCards(cardFeeds ?? {}, cardLists, feedKey).length > 0;
    const title = getCustomOrFormattedFeedName(translate, feedKey, cardFeed?.customFeedName, false);
    const pendingField = `${CONST.BUSINESS_CENTRAL_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_CARD_PROGRAM_ACCOUNT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        businessCentralData?.bankAccounts?.map((bankAccount) => ({
            value: bankAccount.id,
            text: `${companyCardAccountID === bankAccount.id ? `${translate('common.default')} - ` : ''}${bankAccount.number} ${bankAccount.name}`,
            keyForList: bankAccount.id,
            isSelected: cardProgramAccountID === bankAccount.id,
        })) ?? [];
    const {filteredData: filteredUnprocessedData, textInputOptions} = useSelectionListSearch(data);
    const filteredData = sortDefaultToTop(filteredUnprocessedData, (bankAccount) => companyCardAccountID === bankAccount.keyForList, styles);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.cardProgramAccount.descriptionLevel2')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.businessCentral.noBankAccountsFound')}
            subtitle={translate('workspace.businessCentral.noBankAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectBankAccount = (item: AccountListItem) => {
        if (item.value !== cardProgramAccountID && policyID && feedKey) {
            // Choosing the company card account clears the feed's override
            const value = item.value === companyCardAccountID ? '' : item.value;
            const oldValue = cardProgramAccountID === companyCardAccountID ? undefined : cardProgramAccountID;
            updateBusinessCentralCardProgramAccount(policyID, feedKey, value, oldValue);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralCardProgramAccountSelectorPage"
            headerTitleAlreadyTranslated={title}
            data={filteredData}
            textInputOptions={textInputOptions}
            shouldBeBlocked={!hasActiveCards}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectBankAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={cardProgramAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([pendingField], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, pendingField)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, pendingField)}
        />
    );
}

export default withPolicyConnections(BusinessCentralCardProgramAccountSelectorPage);
