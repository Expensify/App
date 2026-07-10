import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCustomOrFormattedFeedName} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {CardFeed, CardFeedWithDomainID} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

function RilletCardProgramAccount({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const creditCardAccountCode = rilletConfig?.export?.creditCardAccountCode;
    const cardProgramsUsingCustomAccounts = rilletConfig?.export?.cardProgramAccounts;

    const [cardFeeds] = useCardFeeds(policyID);
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);

    const cardsUsingCustomAccountsPerFeedCount: Partial<Record<CardFeed, number>> = {};
    for (const workspaceCardList of Object.values(cardList ?? {})) {
        for (const card of Object.values(workspaceCardList ?? {})) {
            if (typeof card.nameValuePairs !== 'object') {
                continue;
            }
            if (!(CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT in card.nameValuePairs)) {
                continue;
            }
            const feedKey = card.bank as CardFeed;
            cardsUsingCustomAccountsPerFeedCount[feedKey] = (cardsUsingCustomAccountsPerFeedCount[feedKey] ?? 0) + 1;
        }
    }

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
            shouldBeBlocked
        >
            <View style={[styles.mv3, styles.mh5]}>
                <Text>{translate('workspace.rillet.cardProgramAccount.description')}</Text>
            </View>
            {Object.entries(cardFeeds ?? {}).map(([feedWithDomainID, cardFeed]) => {
                const feedKey = cardFeed.feed as CardFeed;
                const feedName = getCustomOrFormattedFeedName(translate, feedKey, cardFeed.customFeedName, false);
                const cardProgramAccountCode = cardProgramsUsingCustomAccounts?.[feedKey] ?? creditCardAccountCode;
                const isUsingDefaultAccount = cardProgramAccountCode === creditCardAccountCode;
                const cardProgramAccount = rilletData?.accounts?.find((account) => account.code === cardProgramAccountCode);
                const cardProgramAccountDisplayName = cardProgramAccount
                    ? `${cardProgramAccount.code} ${cardProgramAccount.name}${isUsingDefaultAccount ? ` (${translate('common.default').toLocaleLowerCase()})` : ''}`
                    : '';
                const cardsUsingCustomAccountsCount = cardsUsingCustomAccountsPerFeedCount[feedKey];
                return (
                    <OfflineWithFeedback
                        key={feedKey}
                        pendingAction={settingsPendingAction([`${CONST.RILLET_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${feedKey}`], rilletConfig?.pendingFields)}
                    >
                        <MenuItemWithTopDescription
                            title={cardProgramAccountDisplayName}
                            description={feedName}
                            hintText={cardsUsingCustomAccountsCount ? translate('workspace.rillet.cardAccount.countInfo', cardsUsingCustomAccountsCount) : undefined}
                            onPress={() =>
                                policyID
                                    ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_CARD_PROGRAM_ACCOUNT_SELECTOR.getRoute(policyID, feedWithDomainID as CardFeedWithDomainID))
                                    : undefined
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
