import ConfirmationPage from '@components/ConfirmationPage';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import {clearAddNewPersonalCardErrors, setAddNewPersonalCardStepAndData} from '@userActions/PersonalCards';

import CONST from '@src/CONST';

import React from 'react';

function PersonalCardsErrorConfirmation() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['QuestionMark']);

    const onButtonPress = () => {
        clearAddNewPersonalCardErrors();
        Navigation.closeRHPFlow();
    };

    const openPlaidLink = () => {
        // Clear the previous attempt's errors, otherwise BankConnection sees them and bounces
        // straight back to this error page without sending a new AddPersonalPlaidCard request
        clearAddNewPersonalCardErrors();
        setAddNewPersonalCardStepAndData({
            step: CONST.PERSONAL_CARDS.STEP.PLAID_CONNECTION,
            data: {
                selectedBank: CONST.PERSONAL_CARDS.BANKS.OTHER,
                cardTitle: undefined,
                feedType: undefined,
            },
            isEditing: false,
        });
    };

    return (
        <ConfirmationPage
            heading={translate('personalCard.bankConnectionError')}
            description={
                <Text style={[styles.textSupporting, styles.textAlignCenter]}>
                    {translate('personalCard.bankConnectionDescription')}{' '}
                    <TextLink
                        style={[styles.link]}
                        onPress={openPlaidLink}
                    >
                        {translate('personalCard.connectWithPlaid')}
                    </TextLink>
                </Text>
            }
            illustration={illustrations.QuestionMark}
            shouldShowButton
            illustrationStyle={styles.errorStateCardIllustration}
            onButtonPress={onButtonPress}
            buttonText={translate('common.buttonConfirm')}
            containerStyle={styles.h100}
        />
    );
}

export default PersonalCardsErrorConfirmation;
