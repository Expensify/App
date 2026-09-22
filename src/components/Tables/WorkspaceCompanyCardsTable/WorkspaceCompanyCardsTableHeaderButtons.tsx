import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import Button from '@components/Button';
import FeedSelector from '@components/FeedSelector';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import TextLink from '@components/TextLink';

import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCardFeeds from '@hooks/useCardFeeds';
import {useCurrencyListState} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLinkedPolicyName} from '@libs/CardFeedUtils';
import {navigateToFeedTransactions} from '@libs/CardNavigationUtils';
import {getCardFeedWithoutDomainID, getCompanyFeeds, getCustomOrFormattedFeedName, isCustomFeed, isDirectFeed} from '@libs/CardUtils';

import Navigation from '@navigation/Navigation';

import {startCardFeedRefresh} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import getShouldShowBrokenConnectionError from './getShouldShowBrokenConnectionError';

const FEED_SELECTOR_SKELETON_WIDTH = 289;

type WorkspaceCompanyCardsTableHeaderButtonsProps = {
    policyID: string;
    feedName: CompanyCardFeedWithDomainID;

    /** The fund ID the feed belongs to, i.e. its domain account ID or the workspace account ID */
    domainOrWorkspaceAccountID: number;

    /** Whether the feed is loading */
    isLoading: boolean;

    /** Whether the current member can edit company cards */
    canWriteCompanyCards: boolean;

    /** Whether the feed is browsable, i.e. it is not loading, pending, missing or in an error state */
    shouldShowViewTransactions: boolean;

    CardFeedIcon: React.ReactNode;
};

function WorkspaceCompanyCardsTableHeaderButtons({
    policyID,
    feedName,
    domainOrWorkspaceAccountID,
    isLoading,
    canWriteCompanyCards,
    shouldShowViewTransactions,
    CardFeedIcon,
}: WorkspaceCompanyCardsTableHeaderButtonsProps) {
    const styles = useThemeStyles();

    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyListState();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'DotIndicator']);

    const [cardFeeds] = useCardFeeds(policyID);
    const policy = usePolicy(policyID);

    const formattedFeedName = feedName ? getCustomOrFormattedFeedName(translate, feedName, cardFeeds?.[feedName]?.customFeedName) : undefined;
    const isCommercialFeed = isCustomFeed(feedName);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = feedName ? companyFeeds?.[feedName] : undefined;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${currentFeedData?.domainID}`);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const {cardFeedErrors, shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();
    const feedErrors = cardFeedErrors[feedName];
    const hasOtherFeedWithRBR = Object.keys(companyFeeds ?? {}).some((feed) => feed !== feedName && shouldShowRbrForFeedNameWithDomainID[feed]);
    const shouldShowFeedSelectorRBR = hasOtherFeedWithRBR || !!feedErrors?.hasWorkspaceErrors;
    const shouldShowBrokenConnectionError = getShouldShowBrokenConnectionError(feedName, feedErrors);
    // Only direct feeds can be reconnected in-app, so other feeds get the message without the bank login link.
    const brokenConnectionMessage = isDirectFeed(feedName) ? translate('workspace.companyCards.brokenConnectionError') : `<rbr>${translate('personalCard.brokenConnection')}</rbr>`;

    const openBankConnection = () => {
        if (!feedName) {
            return;
        }

        // The refresh flow keeps the bank login open until the reconnect completes: expiration change for OAuth,
        // import finishing for Plaid. The broken-connection page would treat a feed that only has feed-level errors
        // as already reconnected and close at once.
        startCardFeedRefresh(policyID, feedName, policy?.outputCurrency, currencyList, countryByIp);
    };

    // The page keys a feed as `<feed>#<domainID>`, while the Search feed filter keys it as `<fundID>_<feed>`.
    const viewTransactions = () => navigateToFeedTransactions(`${domainOrWorkspaceAccountID}_${getCardFeedWithoutDomainID(feedName)}`);

    const isCsvFeed = feedName?.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV);
    const firstPart = translate(isCommercialFeed ? 'workspace.companyCards.commercialFeed' : 'workspace.companyCards.directFeed');
    const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;
    const policyName = getLinkedPolicyName(allPolicies, currentFeedData?.preferredPolicy, policyID, policy?.name);
    const secondPart = ` (${domainName ?? policyName})`;
    const supportingText = isCsvFeed ? translate('cardPage.csvCardDescription') : `${firstPart}${secondPart}`;

    const shouldShowNarrowLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    return (
        <View>
            <View style={[styles.w100, styles.ph5, styles.gap5, styles.pb2, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, !shouldShowNarrowLayout && styles.pv2]}>
                {isLoading ? (
                    <AccountSwitcherSkeletonView
                        avatarSize={CONST.AVATAR_SIZE.DEFAULT}
                        width={FEED_SELECTOR_SKELETON_WIDTH}
                        style={[shouldShowNarrowLayout ? [styles.mb2, styles.mt2] : [styles.mb11, styles.mt2], styles.mw100]}
                    />
                ) : (
                    <FeedSelector
                        // The selector's inner text column is `flex1`, which Yoga measures as zero-width when the selector
                        // itself is content-sized in a row, so the feed name disappears on native without an explicit basis.
                        wrapperStyle={styles.flex1}
                        onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID ?? String(CONST.DEFAULT_NUMBER_ID)))}
                        CardFeedIcon={CardFeedIcon}
                        feedName={formattedFeedName}
                        supportingText={supportingText}
                        shouldShowRBR={shouldShowFeedSelectorRBR}
                    />
                )}

                {!isLoading && canWriteCompanyCards && (
                    <Button
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID ?? String(CONST.DEFAULT_NUMBER_ID)))}
                        accessibilityLabel={translate('common.settings')}
                        // Zeroing the horizontal padding squares the button off so the icon-only variant renders as a circle.
                        innerStyles={shouldShowNarrowLayout ? styles.ph0 : undefined}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.SETTINGS_BUTTON}
                    >
                        <Button.Icon src={icons.Gear} />
                        {/* Dropping the label on small screens keeps the button in the feed selector's row instead of a full-width row of its own. */}
                        {!shouldShowNarrowLayout && <Button.Text>{translate('common.settings')}</Button.Text>}
                    </Button>
                )}
            </View>

            {shouldShowViewTransactions && (
                <View style={[styles.flexRow, styles.ph5, styles.pb2]}>
                    {/* Label size matches the balance and feed labels this link sits between. */}
                    <TextLink
                        onPress={viewTransactions}
                        style={styles.label}
                    >
                        {translate('workspace.common.viewTransactions')}
                    </TextLink>
                </View>
            )}

            {!isLoading && canWriteCompanyCards && shouldShowBrokenConnectionError && (
                <View style={[styles.flexRow, styles.ph5, styles.alignItemsCenter]}>
                    <Icon
                        src={icons.DotIndicator}
                        fill={theme.danger}
                        additionalStyles={styles.mr1}
                    />
                    <View style={[styles.offlineFeedbackText, styles.pr5, styles.flexRow, styles.w100]}>
                        <RenderHTML
                            html={brokenConnectionMessage}
                            onLinkPress={openBankConnection}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

export default WorkspaceCompanyCardsTableHeaderButtons;
