import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import type {CombinedCardFeed, CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import useCardFeedsForActivePolicies from '@hooks/useCardFeedsForActivePolicies';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useCompanyCards from '@hooks/useCompanyCards';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CardFeedForDisplay} from '@libs/CardFeedUtils';
import {getLinkedPolicyName} from '@libs/CardFeedUtils';
import {getCardFeedIcon, getCardFeedWithDomainID, getCustomOrFormattedFeedName, getPlaidInstitutionIconUrl} from '@libs/CardUtils';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {updateSelectedFeed} from '@userActions/Card';
import {clearAddNewCardFlow, linkCardFeedToPolicy} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

type CardFeedListItem = ListItem & {
    /** Combined feed key */
    value: CompanyCardFeedWithDomainID;

    /** Card feed value */
    feed: CompanyCardFeedWithNumber;

    /** Feed fund value */
    fundID?: number;

    /** Feed country value */
    country?: string;
};

type WorkspaceCompanyCardFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED>;

function WorkspaceCompanyCardFeedSelectorPage({route}: WorkspaceCompanyCardFeedSelectorPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const {isBlockedToAddNewFeeds} = useIsBlockedToAddFeed(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const {companyCardFeeds, feedName: selectedFeedName} = useCompanyCards({policyID});
    const {shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();
    const {cardFeedsByPolicy} = useCardFeedsForActivePolicies();
    const primaryContactMethod = usePrimaryContactMethod();

    const isUserFromPublicDomain = isEmailPublicDomain(primaryContactMethod);

    const feeds: CardFeedListItem[] = (Object.entries(companyCardFeeds ?? {}) as Array<[CompanyCardFeedWithDomainID, CombinedCardFeed]>).map(([feedName, feedSettings]) => {
        const plaidUrl = getPlaidInstitutionIconUrl(feedSettings.feed);
        const domain = allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${feedSettings.domainID}`];
        const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;

        const shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feedName];

        const policyName = getLinkedPolicyName(allPolicies, feedSettings?.preferredPolicy, policyID, policy?.name);

        return {
            value: feedName,
            feed: feedSettings.feed as CompanyCardFeedWithNumber,
            alternateText: domainName ?? policyName,
            text: getCustomOrFormattedFeedName(translate, feedSettings.feed, feedSettings.customFeedName),
            keyForList: feedName,
            isSelected: feedName === selectedFeedName,
            isDisabled: feedSettings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            pendingAction: feedSettings.pendingAction,
            brickRoadIndicator: shouldShowRBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            canShowSeveralIndicators: shouldShowRBR,
            leftElement: plaidUrl ? (
                <PlaidCardFeedIcon
                    plaidUrl={plaidUrl}
                    style={styles.mr3}
                />
            ) : (
                <Icon
                    src={getCardFeedIcon(feedSettings.feed, illustrations, companyCardFeedIcons)}
                    height={variables.cardIconHeight}
                    width={variables.cardIconWidth}
                    additionalStyles={[styles.mr3, styles.cardIcon]}
                />
            ),
        };
    });

    const getOtherFeeds = () => {
        const otherPolicyFeeds: CardFeedListItem[] = [];
        for (const [feedPolicyID, cardFeeds] of Object.entries(cardFeedsByPolicy ?? {}) as Array<[CompanyCardFeedWithDomainID, CardFeedForDisplay[]]>) {
            if (feedPolicyID === policyID) {
                continue;
            }
            for (const feed of cardFeeds) {
                if (feed?.linkedPolicyIDs?.includes(policyID)) {
                    continue;
                }
                const feedName = feed.feed;
                const plaidUrl = getPlaidInstitutionIconUrl(feedName);
                const domain = allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${feed.fundID}`];
                const feedPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${feedPolicyID}`];
                const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;

                const shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feedName];

                otherPolicyFeeds.push({
                    value: feed.id as CompanyCardFeedWithDomainID,
                    feed: feedName as CompanyCardFeedWithNumber,
                    fundID: Number(feed.fundID),
                    country: feed?.country,
                    alternateText: domainName ?? feedPolicy?.name,
                    text: getCustomOrFormattedFeedName(translate, feedName, feed.name),
                    keyForList: feed.id,
                    isSelected: feed.id === selectedFeedName,
                    brickRoadIndicator: shouldShowRBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                    canShowSeveralIndicators: shouldShowRBR,
                    leftElement: plaidUrl ? (
                        <PlaidCardFeedIcon
                            plaidUrl={plaidUrl}
                            style={styles.mr3}
                        />
                    ) : (
                        <Icon
                            src={getCardFeedIcon(feed.feed, illustrations, companyCardFeedIcons)}
                            height={variables.cardIconHeight}
                            width={variables.cardIconWidth}
                            additionalStyles={[styles.mr3, styles.cardIcon]}
                        />
                    ),
                });
            }
        }
        return otherPolicyFeeds;
    };

    const otherFeeds = getOtherFeeds();

    const onAddCardsPress = () => {
        clearAddNewCardFlow();
        if (isBlockedToAddNewFeeds) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID)),
            );
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID));
    };

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));

    const selectFeed = (feed: CardFeedListItem) => {
        updateSelectedFeed(feed.value, policyID);
        goBack();
    };

    const selectOtherFeed = (feed: CardFeedListItem) => {
        if (isUserFromPublicDomain) {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_ADD_WORK_EMAIL.getRoute(policyID, feed.value));
            return;
        }
        if (!feed.fundID) {
            return;
        }
        const feedValue = getCardFeedWithDomainID(feed.feed, feed.fundID) as CompanyCardFeedWithDomainID;
        linkCardFeedToPolicy(feed.fundID, policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.COMPANY_CARD, feed?.country, feed.feed);
        updateSelectedFeed(feedValue, policyID);
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceCompanyCardFeedSelectorPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCards')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    ListItem={RadioListItem}
                    onSelectRow={selectFeed}
                    data={feeds}
                    alternateNumberOfSupportedLines={2}
                    initiallyFocusedItemKey={selectedFeedName}
                    addBottomSafeAreaPadding
                    listFooterContent={
                        <>
                            <MenuItem
                                title={translate('workspace.companyCards.addCards')}
                                icon={icons.Plus}
                                onPress={onAddCardsPress}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.CARD_SECTION_ADD_BUTTON}
                            />
                            {otherFeeds.length > 0 && (
                                <>
                                    <Text style={[styles.ph5, styles.mv2, styles.textLabelSupporting]}>{translate('workspace.companyCards.fromOtherWorkspaces')}</Text>
                                    {otherFeeds.map((feed) => (
                                        <RadioListItem
                                            key={feed.value}
                                            keyForList={feed.value}
                                            showTooltip={false}
                                            item={feed}
                                            onSelectRow={selectOtherFeed}
                                        />
                                    ))}
                                    <View style={[styles.ph5, styles.mt2]}>
                                        <RenderHTML html={translate('workspace.companyCards.otherWorkspacesDescription')} />
                                    </View>
                                </>
                            )}
                        </>
                    }
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardFeedSelectorPage;
