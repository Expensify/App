import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import RenderHTML from '@components/RenderHTML';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

function UpgradeConfirmation({addCompanyCard, addPersonalCard}: {addCompanyCard: () => void; addPersonalCard: () => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const [subscriptionLink, setSubscriptionLink] = useState('');

    const updateSubscriptionLink = useCallback(() => {
        const backTo = Navigation.getActiveRoute();
        setSubscriptionLink(`${environmentURL}/${ROUTES.SETTINGS_SUBSCRIPTION.getRoute(backTo)}`);
    }, [environmentURL]);

    useEffect(() => {
        Navigation.isNavigationReady().then(() => updateSubscriptionLink());
    }, [updateSubscriptionLink]);

    return (
        <ConfirmationPage style={styles.h100}>
            <ConfirmationPage.Content>
                <ConfirmationPage.Illustration />
                <ConfirmationPage.Heading>{translate('personalCard.newWorkspace')}</ConfirmationPage.Heading>
                <View style={[styles.renderHTML, styles.w100]}>
                    <RenderHTML html={translate('personalCard.successMessage', {subscriptionLink})} />
                </View>
            </ConfirmationPage.Content>
            <FixedFooter>
                <ConfirmationPage.SecondaryButton
                    text={translate('personalCard.addCompanyCard')}
                    onPress={addCompanyCard}
                />
                <ConfirmationPage.PrimaryButton
                    text={translate('personalCard.addPersonalCard')}
                    onPress={addPersonalCard}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default UpgradeConfirmation;
