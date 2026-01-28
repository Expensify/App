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
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCardFeeds from '@hooks/useCardFeeds';
import useCurrencyList from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyFeeds, getCustomOrFormattedFeedName, getPlaidCountry, getPlaidInstitutionId, isCustomFeed} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import {setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx';

const FEED_SELECTOR_SKELETON_WIDTH = 289;

type WorkspaceCompanyCardsTableHeaderButtonsProps = {
    /** Current policy id */
    policyID: string;

    /** Currently selected feed */
    feedName: CompanyCardFeedWithDomainID;

    /** Whether the feed is loading */
    isLoading: boolean;

    /** Whether to show the table controls */
    showTableControls: boolean;

    /** Card feed icon */
    CardFeedIcon: React.ReactNode;
};

function WorkspaceCompanyCardsTableHeaderButtons({policyID, feedName, isLoading, showTableControls, CardFeedIcon}: WorkspaceCompanyCardsTableHeaderButtonsProps) {
    const styles = useThemeStyles();

    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyList();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    const [cardFeeds] = useCardFeeds(policyID);
    const policy = usePolicy(policyID);

    const formattedFeedName = feedName ? getCustomOrFormattedFeedName(translate, feedName as CompanyCardFeed, cardFeeds?.[feedName]?.customFeedName) : undefined;
    const isCommercialFeed = isCustomFeed(feedName as CompanyCardFeed);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = feedName ? companyFeeds?.[feedName] : undefined;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${currentFeedData?.domainID}`, {canBeMissing: true});
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});

    const {cardFeedErrors} = useCardFeedErrors();
    const feedErrors = cardFeedErrors[feedName];
    const hasFeedErrors = feedErrors?.hasFeedErrors;
    const isFeedConnectionBroken = feedErrors?.isFeedConnectionBroken;
    const shouldShowRBR = feedErrors?.shouldShowRBR;

    const openBankConnection = () => {
        if (!feedName) {
            return;
        }

        const institutionId = getPlaidInstitutionId(feedName);
        const initialStep = institutionId ? CONST.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST.COMPANY_CARD.STEP.BANK_CONNECTION;

        // For Plaid feeds, seed selectedCountry so PlaidConnectionStep can start the login flow
        if (institutionId) {
            const country = getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
            setAddNewCompanyCardStepAndData({
                data: {
                    selectedCountry: country,
                },
            });
        }

        setAssignCardStepAndData({currentStep: initialStep});

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION.getRoute(policyID ?? String(CONST.DEFAULT_NUMBER_ID), feedName));
        });
    };

    const secondaryActions = [
        {
            icon: icons.Gear,
            text: translate('common.settings'),
            onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID ?? String(CONST.DEFAULT_NUMBER_ID))),
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
                {isLoading ? (
                    <AccountSwitcherSkeletonView
                        avatarSize={CONST.AVATAR_SIZE.DEFAULT}
                        width={FEED_SELECTOR_SKELETON_WIDTH}
                        style={[shouldShowNarrowLayout ? [styles.mb2, styles.mt2] : styles.mb11, styles.mw100]}
                    />
                ) : (
                    <FeedSelector
                        onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID ?? String(CONST.DEFAULT_NUMBER_ID)))}
                        CardFeedIcon={CardFeedIcon}
                        feedName={formattedFeedName}
                        supportingText={supportingText}
                        shouldShowRBR={shouldShowRBR}
                    />
                )}

                <View
                    style={[styles.alignItemsCenter, styles.gap3, shouldShowNarrowLayout ? [styles.flexColumnReverse, styles.w100, styles.alignItemsStretch, styles.gap5] : styles.flexRow]}
                >
                    {!isLoading && showTableControls && (
                        <View style={[styles.mnw200]}>
                            <Table.SearchBar />
                        </View>
                    )}

                    <View style={[styles.flexRow, styles.gap3]}>
                        {!isLoading && (
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
            {!isLoading && (isFeedConnectionBroken || hasFeedErrors) && (
                <View style={[styles.flexRow, styles.ph5, styles.alignItemsCenter]}>
                    <Icon
                        src={expensifyIcons.DotIndicator}
                        fill={theme.danger}
                        additionalStyles={styles.mr1}
                    />
                    <View style={[styles.offlineFeedbackText, styles.pr5, styles.flexRow, styles.w100]}>
                        <RenderHTML
                            html={translate('workspace.companyCards.brokenConnectionError')}
                            onLinkPress={openBankConnection}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

export default WorkspaceCompanyCardsTableHeaderButtons;
