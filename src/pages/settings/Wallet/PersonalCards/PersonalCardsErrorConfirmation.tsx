import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import {clearAddNewPersonalCardErrors, setAddNewPersonalCardStepAndData} from '@userActions/PersonalCards';

import CONST from '@src/CONST';

import React from 'react';

type PersonalCardsErrorConfirmationProps = {
    /** Backend-supplied bank connection error message to display */
    errorMessage?: string;
};

function PersonalCardsErrorConfirmation({errorMessage}: PersonalCardsErrorConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['QuestionMark']);

    const onButtonPress = () => {
        clearAddNewPersonalCardErrors();
        Navigation.closeRHPFlow();
    };

    const openPlaidLink = () => {
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
        <ConfirmationPage style={styles.h100}>
            <ConfirmationPage.Content>
                <ConfirmationPage.Illustration
                    illustration={illustrations.QuestionMark}
                    illustrationStyle={styles.errorStateCardIllustration}
                />
                <ConfirmationPage.Heading>{translate('personalCard.bankConnectionError')}</ConfirmationPage.Heading>
                <ConfirmationPage.Description>
                    <Text style={[styles.textSupporting, styles.textAlignCenter]}>
                        {!!errorMessage && `${errorMessage} `}
                        {translate('personalCard.bankConnectionDescription')}{' '}
                        <TextLink
                            style={[styles.link]}
                            onPress={openPlaidLink}
                        >
                            {translate('personalCard.connectWithPlaid')}
                        </TextLink>
                    </Text>
                </ConfirmationPage.Description>
            </ConfirmationPage.Content>
            <FixedFooter>
                <ConfirmationPage.PrimaryButton
                    text={translate('common.buttonConfirm')}
                    onPress={onButtonPress}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default PersonalCardsErrorConfirmation;
