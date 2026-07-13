import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {areCardsCustomExportInErrorFields, getCardsCustomExportPendingAction, getCardsUsingCustomExportCount} from '@libs/CardFeedUtils';
import {getCustomOrFormattedFeedName} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CardFeed, CardFeedWithDomainID} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

function RilletCardAccount({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const creditCardAccountCode = rilletConfig?.export?.creditCardAccountCode;
    const cardProgramsUsingCustomAccounts = rilletConfig?.export?.cardProgramAccounts;
    const cardsUsingCustomAccountsCount = getCardsUsingCustomExportCount(cardFeeds ?? {}, cardList ?? {}, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT);

    return (
        <ConnectionLayout
            displayName="RilletCardAccount"
            headerTitle="workspace.rillet.cardAccount.label"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.cardAccount.description')}</Text>
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
                return (
                    <OfflineWithFeedback
                        key={feedKey}
                        pendingAction={getCardsCustomExportPendingAction(cardFeeds ?? {}, cardList ?? {}, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT, feedKey)}
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
                                policyID
                                    ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_CARD_ACCOUNT_CARD_LIST.getRoute(policyID, feedWithDomainID as CardFeedWithDomainID))
                                    : undefined
                            }
                            shouldShowRightIcon
                            brickRoadIndicator={
                                areCardsCustomExportInErrorFields(cardFeeds ?? {}, cardList ?? {}, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT, feedKey)
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

export default withPolicyConnections(RilletCardAccount);
