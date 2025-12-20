import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import FeedSelector from '@components/FeedSelector';
import Icon from '@components/Icon';
// eslint-disable-next-line no-restricted-imports
import RenderHTML from '@components/RenderHTML';
import Table from '@components/Table';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {
    checkIfFeedConnectionIsBroken,
    filterInactiveCards,
    flatAllCardsList,
    getBankName,
    getCompanyCardFeed,
    getCompanyFeeds,
    getCustomOrFormattedFeedName,
    getDomainOrWorkspaceAccountID,
    getPlaidInstitutionId,
    isCustomFeed,
} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

const FEED_SELECTOR_SKELETON_WIDTH = 289;

type WorkspaceCompanyCardsTableHeaderButtonsProps = {
    /** Current policy id */
    policyID: string | undefined;

    /** Currently selected feed */
    feedName: CompanyCardFeedWithDomainID | undefined;

    /** Whether the feed is loading */
    isLoadingFeed?: boolean;

    /** Whether to show the table controls */
    showTableControls: boolean;

    /** Card feed icon */
    CardFeedIcon?: React.ReactNode;
};

function WorkspaceCompanyCardsTableHeaderButtons({policyID, feedName, isLoadingFeed, showTableControls, CardFeedIcon}: WorkspaceCompanyCardsTableHeaderButtonsProps) {
    const styles = useThemeStyles();

    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const policy = usePolicy(policyID);
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: false});
    const feed = getCompanyCardFeed(feedName);
    const formattedFeedName = feedName ? getCustomOrFormattedFeedName(feed, cardFeeds?.[feedName]?.customFeedName) : undefined;
    const isCommercialFeed = isCustomFeed(feedName);
    const isPlaidCardFeed = !!getPlaidInstitutionId(feedName);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = feedName ? companyFeeds?.[feedName] : undefined;
    const bankName = isPlaidCardFeed && formattedFeedName ? formattedFeedName : getBankName(feed);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, currentFeedData);
    const filteredFeedCards = filterInactiveCards(allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${feedName}`]);
    const hasFeedError = feedName ? !!cardFeeds?.[feedName]?.errors : false;
    const isSelectedFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredFeedCards) || hasFeedError;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${currentFeedData?.domainID}`, {canBeMissing: true});

    const openBankConnection = () => {
        if (!feedName) {
            return;
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION.getRoute(policyID ?? '', feedName)));
    };

    const secondaryActions = [
        {
            icon: icons.Gear,
            text: translate('common.settings'),
            onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID ?? '')),
            value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
        },
    ];

    const firstPart = translate(isCommercialFeed ? 'workspace.companyCards.commercialFeed' : 'workspace.companyCards.directFeed');
    const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;
    const secondPart = ` (${domainName ?? policy?.name})`;
    const supportingText = `${firstPart}${secondPart}`;

    const shouldShowNarrowLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    return (
        <View>
            <View
                style={[
                    styles.w100,
                    styles.ph5,
                    styles.gap5,
                    styles.pb2,
                    !shouldShowNarrowLayout && [styles.flexColumn, styles.pv2, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween],
                ]}
            >
                {isLoadingFeed ? (
                    <AccountSwitcherSkeletonView
                        avatarSize={CONST.AVATAR_SIZE.DEFAULT}
                        width={FEED_SELECTOR_SKELETON_WIDTH}
                        style={[shouldShowNarrowLayout ? [styles.mb2, styles.mt2] : styles.mb11, styles.mw100]}
                    />
                ) : (
                    <FeedSelector
                        onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID ?? ''))}
                        CardFeedIcon={CardFeedIcon}
                        feedName={formattedFeedName}
                        supportingText={supportingText}
                        shouldShowRBR={checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, domainOrWorkspaceAccountID), feedName)}
                    />
                )}

                <View
                    style={[styles.alignItemsCenter, styles.gap3, shouldShowNarrowLayout ? [styles.flexColumnReverse, styles.w100, styles.alignItemsStretch, styles.gap5] : styles.flexRow]}
                >
                    {!isLoadingFeed && showTableControls && (
                        <View style={[styles.mnw200]}>
                            <Table.SearchBar />
                        </View>
                    )}

                    <View style={[styles.flexRow, styles.gap3]}>
                        {!isLoadingFeed && (
                            <>
                                {showTableControls && <Table.FilterButtons style={shouldShowNarrowLayout && [styles.flex1]} />}
                                <ButtonWithDropdownMenu
                                    success={false}
                                    onPress={() => {}}
                                    shouldUseOptionIcon
                                    customText={translate('common.more')}
                                    options={secondaryActions}
                                    isSplitButton={false}
                                    wrapperStyle={shouldShowNarrowLayout ? styles.flex1 : styles.flexGrow0}
                                />
                            </>
                        )}
                    </View>
                </View>
            </View>
            {isSelectedFeedConnectionBroken && !!bankName && (
                <View style={[styles.flexRow, styles.ph5, styles.alignItemsCenter]}>
                    <Icon
                        src={expensifyIcons.DotIndicator}
                        fill={theme.danger}
                        additionalStyles={styles.mr1}
                    />
                    <Text style={[styles.offlineFeedbackText, styles.pr5]}>
                        <RenderHTML
                            html={translate('workspace.companyCards.brokenConnectionError')}
                            onLinkPress={openBankConnection}
                        />
                    </Text>
                </View>
            )}
        </View>
    );
}

export default WorkspaceCompanyCardsTableHeaderButtons;
