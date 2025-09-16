import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import {BrokenHumptyDumpty} from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import {enableExpensifyCard} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type Props = {
    policyID?: string;
};

function WorkspaceCompanyCardsErrorConfirmation({policyID}: Props) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const isExpensifyCardFeatureEnabled = !!policy?.areExpensifyCardsEnabled;

    const onButtonPress = () => {
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
                <Text style={styles.textSupporting}>
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
            illustration={BrokenHumptyDumpty}
            shouldShowButton
            onButtonPress={onButtonPress}
            buttonText={translate('common.buttonConfirm')}
            containerStyle={styles.h100}
        />
    );
}

export default WorkspaceCompanyCardsErrorConfirmation;
