import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FeedSelector from '@components/FeedSelector';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
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
    isCustomFeed,
} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';

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
    const StyleUtils = useStyleUtils();
    const illustrations = useThemeIllustrations();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const shouldChangeLayout = isMediumScreenWidth || shouldUseNarrowLayout;
    const formattedFeedName = getCustomOrFormattedFeedName(selectedFeed, cardFeeds?.settings?.companyCardNicknames);
    const isCommercialFeed = isCustomFeed(selectedFeed);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = companyFeeds?.[selectedFeed];
    const bankName = getBankName(selectedFeed);
    const filteredFeedCards = filterInactiveCards(allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`]);
    const isSelectedFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredFeedCards);

    return (
        <View>
            <View style={[styles.w100, styles.ph5, !shouldChangeLayout ? [styles.pv2, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween] : styles.pb2]}>
                <FeedSelector
                    onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID))}
                    cardIcon={getCardFeedIcon(selectedFeed, illustrations)}
                    shouldChangeLayout={shouldChangeLayout}
                    feedName={formattedFeedName}
                    supportingText={translate(isCommercialFeed ? 'workspace.companyCards.commercialFeed' : 'workspace.companyCards.directFeed')}
                    shouldShowRBR={checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, workspaceAccountID), selectedFeed)}
                />
                <View style={[styles.flexRow, styles.gap2]}>
                    {!!shouldShowAssignCardButton && (
                        <Button
                            success
                            isDisabled={!currentFeedData || !!currentFeedData?.pending || isSelectedFeedConnectionBroken}
                            onPress={handleAssignCard}
                            icon={Expensicons.Plus}
                            text={translate('workspace.companyCards.assignCard')}
                            style={shouldChangeLayout && styles.flex1}
                        />
                    )}
                    <Button
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID))}
                        icon={Expensicons.Gear}
                        text={translate('common.settings')}
                        style={shouldChangeLayout && styles.flex1}
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
                    <Text style={styles.offlineFeedback.text}>
                        <Text style={[StyleUtils.getDotIndicatorTextStyles(true)]}>{translate('workspace.companyCards.brokenConnectionErrorFirstPart')}</Text>
                        <TextLink
                            style={[StyleUtils.getDotIndicatorTextStyles(), styles.link]}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(policyID, bankName, Navigation.getActiveRoute()))}
                        >
                            {translate('workspace.companyCards.brokenConnectionErrorLink')}
                        </TextLink>
                        <Text style={[StyleUtils.getDotIndicatorTextStyles(true)]}>{translate('workspace.companyCards.brokenConnectionErrorSecondPart')}</Text>
                    </Text>
                </View>
            )}
        </View>
    );
}

WorkspaceCompanyCardsListHeaderButtons.displayName = 'WorkspaceCompanyCardsListHeaderButtons';

export default WorkspaceCompanyCardsListHeaderButtons;
