import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletCardProgramAccount} from '@libs/actions/connections/Rillet';
import {getCustomOrFormattedFeedName, splitCardFeedWithDomainID} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
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
import type {CardFeed} from '@src/types/onyx';
import type {RilletAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: RilletAccount['code'];
};

type RilletCardProgramAccountSelectorProps = WithPolicyConnectionsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RILLET_CARD_PROGRAM_ACCOUNT_SELECTOR>;

function RilletCardProgramAccountSelector({
    policy,
    route: {
        params: {feed: feedWithDomainID},
    },
}: RilletCardProgramAccountSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const cardFeed = cardFeeds?.[feedWithDomainID];
    const feedKey = splitCardFeedWithDomainID(feedWithDomainID)?.feedName as CardFeed;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const creditCardAccountCode = rilletConfig?.export?.creditCardAccountCode;
    const cardProgramsUsingCustomAccounts = rilletConfig?.export?.cardProgramAccounts;
    const cardProgramAccountCode = cardProgramsUsingCustomAccounts?.[feedKey] ?? creditCardAccountCode;
    const title = getCustomOrFormattedFeedName(translate, feedKey, cardFeed?.customFeedName, false);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_CARD_PROGRAM_ACCOUNT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        rilletData?.accounts
            ?.filter(
                (accountItem) =>
                    accountItem.type === CONST.RILLET_ACCOUNT_TYPE.LIABILITY &&
                    accountItem.subtype === CONST.RILLET_ACCOUNT_SUBTYPE.CREDIT_CARD &&
                    accountItem.status === CONST.RILLET_ACCOUNT_STATUS.ACTIVE,
            )
            .map((accountItem) => ({
                value: accountItem.code,
                text: `${creditCardAccountCode === accountItem.code ? `${translate('common.default')} - ` : ''}${accountItem.code} ${accountItem.name}`,
                keyForList: accountItem.code,
                isSelected: cardProgramAccountCode === accountItem.code,
            })) ?? [];

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.cardProgramAccount.descriptionLevel2')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.rillet.noAccountsFound')}
            subtitle={translate('workspace.rillet.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectCreditCardAccount = (item: AccountListItem) => {
        if (item.value !== cardProgramAccountCode && policyID) {
            // Choosing the default account clears the custom account
            const value = item.value === creditCardAccountCode ? '' : item.value;
            const oldValue = cardProgramAccountCode === creditCardAccountCode ? undefined : cardProgramAccountCode;
            updateRilletCardProgramAccount(policyID, feedKey, value, oldValue);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="RilletCardProgramAccountSelector"
            headerTitleAlreadyTranslated={title}
            data={data}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectCreditCardAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={cardProgramAccountCode}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([`${CONST.RILLET_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, `${CONST.RILLET_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, `${CONST.RILLET_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`)}
        />
    );
}

export default withPolicyConnections(RilletCardProgramAccountSelector);
