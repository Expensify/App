import {Str} from 'expensify-common';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCardFeeds from '@hooks/useCardFeeds';
import type {CombinedCardFeed, CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    checkIfFeedConnectionIsBroken,
    filterInactiveCards,
    getCardFeedIcon,
    getCompanyFeeds,
    getCustomOrFormattedFeedName,
    getDomainOrWorkspaceAccountID,
    getPlaidInstitutionIconUrl,
    getSelectedFeed,
} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {updateSelectedFeed} from '@userActions/Card';
import {clearAddNewCardFlow} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';

type CardFeedListItem = ListItem & {
    /** Combined feed key */
    value: CompanyCardFeedWithDomainID;

    /** Card feed value */
    feed: CompanyCardFeed;
};

type WorkspaceCompanyCardFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED>;

function WorkspaceCompanyCardFeedSelectorPage({route}: WorkspaceCompanyCardFeedSelectorPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {translate} = useLocalize();
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {canBeMissing: false});
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const [cardFeeds] = useCardFeeds(policyID);
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: false});
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const {isBlockedToAddNewFeeds} = useIsBlockedToAddFeed(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['Plus'] as const);

    const feeds: CardFeedListItem[] = (Object.entries(companyFeeds) as Array<[CompanyCardFeedWithDomainID, CombinedCardFeed]>).map(([key, feedSettings]) => {
        const filteredFeedCards = filterInactiveCards(
            allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${getDomainOrWorkspaceAccountID(workspaceAccountID, feedSettings)}_${feedSettings.feed}`],
        );
        const isFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredFeedCards);
        const plaidUrl = getPlaidInstitutionIconUrl(feedSettings.feed);
        const domain = allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${feedSettings.domainID}`];
        const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;

        return {
            value: key,
            feed: feedSettings.feed,
            alternateText: domainName ?? policy?.name,
            text: getCustomOrFormattedFeedName(feedSettings.feed, feedSettings.customFeedName),
            keyForList: key,
            isSelected: key === selectedFeed,
            isDisabled: feedSettings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            pendingAction: feedSettings.pendingAction,
            brickRoadIndicator: isFeedConnectionBroken ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            canShowSeveralIndicators: isFeedConnectionBroken,
            leftElement: plaidUrl ? (
                <PlaidCardFeedIcon
                    plaidUrl={plaidUrl}
                    style={styles.mr3}
                />
            ) : (
                <Icon
                    src={getCardFeedIcon(feedSettings.feed, illustrations)}
                    height={variables.cardIconHeight}
                    width={variables.cardIconWidth}
                    additionalStyles={[styles.mr3, styles.cardIcon]}
                />
            ),
        };
    });

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

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceCompanyCardFeedSelectorPage.displayName}
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
                    initiallyFocusedItemKey={selectedFeed}
                    addBottomSafeAreaPadding
                    listFooterContent={
                        <MenuItem
                            title={translate('workspace.companyCards.addCards')}
                            icon={icons.Plus}
                            onPress={onAddCardsPress}
                        />
                    }
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardFeedSelectorPage.displayName = 'WorkspaceCompanyCardFeedSelectorPage';

export default WorkspaceCompanyCardFeedSelectorPage;
