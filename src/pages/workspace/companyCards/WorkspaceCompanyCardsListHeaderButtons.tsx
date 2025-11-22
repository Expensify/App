import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import FeedSelector from '@components/FeedSelector';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsAllowedToIssueCompanyCard from '@hooks/useIsAllowedToIssueCompanyCard';
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
import type {CompanyCardFeed, CurrencyList} from '@src/types/onyx';
import type {AssignCardData} from '@src/types/onyx/AssignCard';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceCompanyCardsListHeaderButtonsProps = {
    /** Current policy id */
    policyID: string;

    /** Currently selected feed */
    selectedFeed: CompanyCardFeed;

    /** Whether to show assign card button */
    shouldShowAssignCardButton?: boolean;

    /** Handle assign card action */
    handleAssignCard: () => void;
};

function WorkspaceCompanyCardsListHeaderButtons({policyID, selectedFeed, shouldShowAssignCardButton, handleAssignCard}: WorkspaceCompanyCardsListHeaderButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const illustrations = useThemeIllustrations();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const policy = usePolicy(policyID);
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: false});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const shouldChangeLayout = isMediumScreenWidth || shouldUseNarrowLayout;
    const formattedFeedName = getCustomOrFormattedFeedName(selectedFeed, cardFeeds?.settings?.companyCardNicknames);
    const isCommercialFeed = isCustomFeed(selectedFeed);
    const plaidUrl = getPlaidInstitutionIconUrl(selectedFeed);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = companyFeeds?.[selectedFeed];
    const bankName = plaidUrl && formattedFeedName ? formattedFeedName : getBankName(selectedFeed);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, currentFeedData);
    const filteredFeedCards = filterInactiveCards(allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${selectedFeed}`]);
    const hasFeedError = !!cardFeeds?.settings?.oAuthAccountDetails?.[selectedFeed]?.errors;
    const isSelectedFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredFeedCards) || hasFeedError;
    const isAllowedToIssueCompanyCard = useIsAllowedToIssueCompanyCard({policyID});

    const openBankConnection = () => {
        const institutionId = !!getPlaidInstitutionId(selectedFeed);
        const data: Partial<AssignCardData> = {
            bankName: selectedFeed,
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

    const secondaryActions = useMemo(
        () => [
            {
                icon: Expensicons.Gear,
                text: translate('common.settings'),
                onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID)),
                value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
            },
        ],
        [policyID, translate],
    );

    return (
        <View>
            <View style={[styles.w100, styles.ph5, !shouldChangeLayout ? [styles.pv2, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween] : styles.pb2]}>
                <FeedSelector
                    plaidUrl={plaidUrl}
                    onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID))}
                    cardIcon={getCardFeedIcon(selectedFeed, illustrations)}
                    shouldChangeLayout={shouldChangeLayout}
                    feedName={formattedFeedName}
                    supportingText={translate(isCommercialFeed ? 'workspace.companyCards.commercialFeed' : 'workspace.companyCards.directFeed')}
                    shouldShowRBR={checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, domainOrWorkspaceAccountID), selectedFeed)}
                />
                <View style={[styles.flexRow, styles.gap2]}>
                    {!!shouldShowAssignCardButton && (
                        <Button
                            success
                            isDisabled={!currentFeedData || !!currentFeedData?.pending || isSelectedFeedConnectionBroken || !isAllowedToIssueCompanyCard}
                            onPress={handleAssignCard}
                            icon={Expensicons.Plus}
                            text={translate('workspace.companyCards.assignCard')}
                            style={shouldChangeLayout && styles.flex1}
                        />
                    )}
                    <ButtonWithDropdownMenu
                        success={false}
                        onPress={() => {}}
                        shouldUseOptionIcon
                        customText={translate('common.more')}
                        options={secondaryActions}
                        isSplitButton={false}
                        wrapperStyle={shouldShowAssignCardButton ? styles.flexGrow0 : styles.flex1}
                    />
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

WorkspaceCompanyCardsListHeaderButtons.displayName = 'WorkspaceCompanyCardsListHeaderButtons';

export default WorkspaceCompanyCardsListHeaderButtons;
