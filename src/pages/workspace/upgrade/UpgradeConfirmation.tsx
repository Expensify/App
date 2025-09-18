import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmationPage from '@components/ConfirmationPage';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type Props = {
    policyName: string;
    afterUpgradeAcknowledged: () => void;
    isCategorizing?: boolean;
    isTravelUpgrade?: boolean;
    isDistanceRateUpgrade?: boolean;
};

function UpgradeConfirmation({policyName, afterUpgradeAcknowledged, isCategorizing, isTravelUpgrade, isDistanceRateUpgrade}: Props) {
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

    const description = useMemo(() => {
        if (isCategorizing) {
            return <Text style={[styles.textAlignCenter, styles.w100]}>{translate('workspace.upgrade.completed.categorizeMessage')}</Text>;
        }

        if (isTravelUpgrade) {
            return <Text style={[styles.textAlignCenter, styles.w100]}>{translate('workspace.upgrade.completed.travelMessage')}</Text>;
        }

        if (isDistanceRateUpgrade) {
            return <Text style={[styles.textAlignCenter, styles.w100]}>{translate('workspace.upgrade.completed.distanceRateMessage')}</Text>;
        }

        return (
            <View style={[styles.renderHTML, styles.w100]}>
                <RenderHTML html={translate('workspace.upgrade.completed.successMessage', {policyName, subscriptionLink})} />
            </View>
        );
    }, [isCategorizing, isTravelUpgrade, isDistanceRateUpgrade, policyName, styles.renderHTML, styles.textAlignCenter, styles.w100, translate, subscriptionLink]);

    return (
        <ConfirmationPage
            heading={translate('workspace.upgrade.completed.headline')}
            descriptionComponent={description}
            shouldShowButton
            onButtonPress={afterUpgradeAcknowledged}
            buttonText={translate('workspace.upgrade.completed.gotIt')}
            containerStyle={styles.h100}
        />
    );
}

export default UpgradeConfirmation;
