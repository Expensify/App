import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
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

type WorkspaceCompanyCardsTableHeaderButtonsProps = {
    /** Current policy id */
    policyID: string;

    /** Currently selected feed */
    selectedFeed: CompanyCardFeedWithDomainID;

    /** Whether the feed is pending */
    shouldDisplayTableComponents?: boolean;

    /** Card feed icon */
    CardFeedIcon?: React.ReactNode;
};

function WorkspaceCompanyCardsTableHeaderButtons({policyID, selectedFeed, shouldDisplayTableComponents = false, CardFeedIcon}: WorkspaceCompanyCardsTableHeaderButtonsProps) {
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
    const feed = getCompanyCardFeed(selectedFeed);
    const formattedFeedName = getCustomOrFormattedFeedName(feed, cardFeeds?.[selectedFeed]?.customFeedName);
    const isCommercialFeed = isCustomFeed(selectedFeed);
    const isPlaidCardFeed = !!getPlaidInstitutionId(selectedFeed);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = companyFeeds?.[selectedFeed];
    const bankName = isPlaidCardFeed && formattedFeedName ? formattedFeedName : getBankName(feed);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, currentFeedData);
    const filteredFeedCards = filterInactiveCards(allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${selectedFeed}`]);
    const hasFeedError = !!cardFeeds?.[selectedFeed]?.errors;
    const isSelectedFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredFeedCards) || hasFeedError;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${currentFeedData?.domainID}`, {canBeMissing: true});

    const openBankConnection = () =>
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute({policyID, feed: selectedFeed})));

    const secondaryActions = [
        {
            icon: icons.Gear,
            text: translate('common.settings'),
            onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID)),
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
                <FeedSelector
                    onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID))}
                    CardFeedIcon={CardFeedIcon}
                    feedName={formattedFeedName}
                    supportingText={supportingText}
                    shouldShowRBR={checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, domainOrWorkspaceAccountID), selectedFeed)}
                />
                <View
                    style={[styles.alignItemsCenter, styles.gap3, shouldShowNarrowLayout ? [styles.flexColumnReverse, styles.w100, styles.alignItemsStretch, styles.gap5] : styles.flexRow]}
                >
                    {shouldDisplayTableComponents && <Table.SearchBar />}
                    <View style={[styles.flexRow, styles.gap3]}>
                        {shouldDisplayTableComponents && <Table.FilterButtons style={shouldShowNarrowLayout && [styles.flex1]} />}
                        <ButtonWithDropdownMenu
                            success={false}
                            onPress={() => {}}
                            shouldUseOptionIcon
                            customText={translate('common.more')}
                            options={secondaryActions}
                            isSplitButton={false}
                            wrapperStyle={shouldShowNarrowLayout ? styles.flex1 : styles.flexGrow0}
                        />
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
