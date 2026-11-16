/** Links a card removal warning to the expenses that would be deleted, without confirming removal. */
import useConfirmModal from '@hooks/useConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getUnsubmittedCardTransactionsRoute} from '@libs/CardNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';

import React from 'react';
import {View} from 'react-native';

import RenderHTML from './RenderHTML';
import Text from './Text';

type CardUnsubmittedTransactionsPromptProps = {
    cardIDs: number[];
    descriptionKey:
        | 'workspace.moreFeatures.companyCards.removeCardDescription'
        | 'workspace.moreFeatures.companyCards.unassignCardDescription'
        | 'workspace.moreFeatures.companyCards.unassignCardsDescription';
};

function CardUnsubmittedTransactionsPrompt({cardIDs, descriptionKey}: CardUnsubmittedTransactionsPromptProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const {closeModal} = useConfirmModal();
    const transactionsRoute = getUnsubmittedCardTransactionsRoute(cardIDs);

    if (!transactionsRoute) {
        return <Text>{Parser.htmlToText(translate(descriptionKey, ''))}</Text>;
    }

    const openUnsubmittedTransactions = () => {
        // Close as CLOSE, not CONFIRM, so inspecting expenses never removes a card.
        closeModal();
        Navigation.navigate(transactionsRoute);
    };

    return (
        <View style={[styles.renderHTML, styles.flexRow]}>
            <RenderHTML
                html={translate(descriptionKey, `${environmentURL}/${transactionsRoute}`)}
                onLinkPress={openUnsubmittedTransactions}
            />
        </View>
    );
}

export default CardUnsubmittedTransactionsPrompt;
