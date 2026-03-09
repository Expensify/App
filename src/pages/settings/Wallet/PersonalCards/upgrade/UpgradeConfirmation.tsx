import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import ConfirmationPage from '@components/ConfirmationPage';
import RenderHTML from '@components/RenderHTML';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

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
        <ConfirmationPage
            heading={translate('personalCard.newWorkspace')}
            descriptionComponent={
                <View style={[styles.renderHTML, styles.w100]}>
                    <RenderHTML html={translate('personalCard.successMessage', {subscriptionLink})} />
                </View>
            }
            shouldShowButton
            shouldShowSecondaryButton
            onSecondaryButtonPress={addCompanyCard}
            secondaryButtonText={translate('personalCard.addCompanyCard')}
            onButtonPress={addPersonalCard}
            buttonText={translate('personalCard.addPersonalCard')}
            containerStyle={styles.h100}
        />
    );
}

export default UpgradeConfirmation;
