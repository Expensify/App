import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import FeedSelector from '@components/FeedSelector';
import Icon from '@components/Icon';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import Table from '@components/Table';
import Text from '@components/Text';
import type {CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import useCardFeeds from '@hooks/useCardFeeds';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {
    checkIfFeedConnectionIsBroken,
    filterInactiveCards,
    flatAllCardsList,
    getBankName,
    getCardFeedIcon,
    getCompanyCardFeed,
    getCompanyFeeds,
    getCustomOrFormattedFeedName,
    getDomainOrWorkspaceAccountID,
    getPlaidCountry,
    getPlaidInstitutionIconUrl,
    getPlaidInstitutionId,
    isCustomFeed,
} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import {setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CurrencyList} from '@src/types/onyx';
import type {AssignCardData} from '@src/types/onyx/AssignCard';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceCompanyCardsTableHeaderButtonsProps = {
    /** Current policy id */
    policyID: string;

    /** Currently selected feed */
    selectedFeed: CompanyCardFeedWithDomainID;

    /** Whether the feed is pending */
    shouldDisplayTableComponents?: boolean;
};

function WorkspaceCompanyCardsTableHeaderButtons({policyID, selectedFeed, shouldDisplayTableComponents = false}: WorkspaceCompanyCardsTableHeaderButtonsProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const theme = useTheme();
    const illustrations = useThemeIllustrations();
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);

    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const policy = usePolicy(policyID);
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: false});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const feed = getCompanyCardFeed(selectedFeed);
    const formattedFeedName = getCustomOrFormattedFeedName(feed, cardFeeds?.[selectedFeed]?.customFeedName);
    const isCommercialFeed = isCustomFeed(selectedFeed);
    const plaidUrl = getPlaidInstitutionIconUrl(selectedFeed);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = companyFeeds?.[selectedFeed];
    const bankName = plaidUrl && formattedFeedName ? formattedFeedName : getBankName(feed);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, currentFeedData);
    const filteredFeedCards = filterInactiveCards(allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${selectedFeed}`]);
    const hasFeedError = !!cardFeeds?.[selectedFeed]?.errors;
    const isSelectedFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredFeedCards) || hasFeedError;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${currentFeedData?.domainID}`, {canBeMissing: true});

    const openBankConnection = () => {
        const institutionId = !!getPlaidInstitutionId(selectedFeed);
        const data: Partial<AssignCardData> = {
            bankName: feed,
        };
        if (institutionId) {
            const country = getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
            setAddNewCompanyCardStepAndData({
                data: {
                    selectedCountry: country,
                },
            });
            setAssignCardStepAndData({
                data,
                currentStep: CONST.COMPANY_CARD.STEP.PLAID_CONNECTION,
            });
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed)));
            return;
        }

        setAssignCardStepAndData({data, currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed)));
    };

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
                    plaidUrl={plaidUrl}
                    onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID))}
                    cardIcon={getCardFeedIcon(feed, illustrations, companyCardFeedIcons)}
                    feedName={formattedFeedName}
                    supportingText={supportingText}
                    shouldShowRBR={checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, domainOrWorkspaceAccountID), selectedFeed)}
                />
                <View
                    style={[styles.alignItemsCenter, styles.gap3, shouldShowNarrowLayout ? [styles.flexColumnReverse, styles.w100, styles.alignItemsStretch, styles.gap5] : styles.flexRow]}
                >
                    {shouldDisplayTableComponents && <Table.SearchBar />}
                    <View style={[styles.flexRow, styles.gap3, shouldShowNarrowLayout && [styles.w100]]}>
                        {shouldDisplayTableComponents && <Table.FilterButtons style={shouldShowNarrowLayout && [styles.flex1, styles.flexGrow0, styles.flexShrink0]} />}
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
                        src={Expensicons.DotIndicator}
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
