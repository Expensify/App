import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import {BrokenCompanyCardBankConnection} from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import {deleteWorkspaceCompanyCardFeed, setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import {enableExpensifyCard} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';

type WorkspaceCompanyCardsErrorConfirmationProps = {
    policyID?: string;
    newFeed?: CompanyCardFeed;
};

function WorkspaceCompanyCardsErrorConfirmation({policyID, newFeed}: WorkspaceCompanyCardsErrorConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const isExpensifyCardFeatureEnabled = !!policy?.areExpensifyCardsEnabled;
    const [cardsList] = useCardsList(policyID, newFeed);
    const [cardFeeds] = useCardFeeds(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const selectedFeedData = newFeed ? companyFeeds[newFeed] : undefined;
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeedData);

    const deleteCompanyCardFeed = () => {
        if (!policyID || !newFeed) {
            return;
        }
        const {cardList, ...cards} = cardsList ?? {};
        const cardIDs = Object.keys(cards);
        const feedToOpen = (Object.keys(companyFeeds) as CompanyCardFeed[])
            .filter((feed) => feed !== newFeed && companyFeeds[feed]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .at(0);
        deleteWorkspaceCompanyCardFeed(policyID, domainOrWorkspaceAccountID, newFeed, cardIDs, feedToOpen);
    };

    const onButtonPress = () => {
        deleteCompanyCardFeed();
        Navigation.closeRHPFlow();
    };

    const openPlaidLink = () => {
        if (!policyID) {
            return;
        }
        setAddNewCompanyCardStepAndData({
            step: CONST.COMPANY_CARDS.STEP.PLAID_CONNECTION,
            data: {
                selectedBank: CONST.COMPANY_CARDS.BANKS.OTHER,
                cardTitle: undefined,
                feedType: undefined,
            },
            isEditing: false,
        });
    };

    const openExpensifyCardLink = () => {
        onButtonPress();
        if (!policyID) {
            return;
        }
        if (!isExpensifyCardFeatureEnabled) {
            enableExpensifyCard(policyID, true, true);
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
    };

    return (
        <ConfirmationPage
            heading={translate('workspace.moreFeatures.companyCards.bankConnectionError')}
            description={
                <Text style={[styles.textSupporting, styles.textAlignCenter]}>
                    {translate('workspace.moreFeatures.companyCards.bankConnectionDescription')}{' '}
                    <TextLink
                        style={[styles.link]}
                        onPress={openPlaidLink}
                    >
                        {translate('workspace.moreFeatures.companyCards.connectWithPlaid')}
                    </TextLink>{' '}
                    <Text style={styles.textSupporting}>{translate('common.or')}</Text>{' '}
                    <TextLink
                        style={[styles.link]}
                        onPress={openExpensifyCardLink}
                    >
                        {translate('workspace.moreFeatures.companyCards.connectWithExpensifyCard')}
                    </TextLink>
                </Text>
            }
            illustration={BrokenCompanyCardBankConnection}
            shouldShowButton
            illustrationStyle={styles.errorStateCardIllustration}
            onButtonPress={onButtonPress}
            buttonText={translate('common.buttonConfirm')}
            containerStyle={styles.h100}
        />
    );
}

export default WorkspaceCompanyCardsErrorConfirmation;
