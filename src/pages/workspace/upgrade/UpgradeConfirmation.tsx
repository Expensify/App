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
    /** Friendly name of the plan the workspace was upgraded to (e.g. Collect or Control) */
    planName?: string;
    afterUpgradeAcknowledged: () => void;
    /** Whether is categorizing the expense */
    isCategorizing?: boolean;
    /** Whether is adding an unreported expense to a report */
    isReporting?: boolean;
    isTravelUpgrade?: boolean;
    isDistanceRateUpgrade?: boolean;
    /** Overrides the primary button label (defaults to "Got it, thanks"). */
    buttonText?: string;
};

function UpgradeConfirmation({policyName, planName, afterUpgradeAcknowledged, isReporting, isCategorizing, isTravelUpgrade, isDistanceRateUpgrade, buttonText}: Props) {
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
        if (isCategorizing || isReporting) {
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
                <RenderHTML html={translate('workspace.upgrade.completed.successMessage', policyName, planName ?? translate('workspace.type.control'), subscriptionLink)} />
            </View>
        );
    }, [isDistanceRateUpgrade, isCategorizing, isReporting, isTravelUpgrade, policyName, planName, styles.renderHTML, styles.textAlignCenter, styles.w100, translate, subscriptionLink]);

    const heading = useMemo(() => {
        if (isCategorizing || isReporting) {
            return translate('workspace.upgrade.completed.createdWorkspace');
        }
        return translate('workspace.upgrade.completed.headline');
    }, [isCategorizing, isReporting, translate]);

    return (
        <ConfirmationPage
            heading={heading}
            descriptionComponent={description}
            shouldShowButton
            onButtonPress={afterUpgradeAcknowledged}
            buttonText={buttonText ?? translate('workspace.upgrade.completed.gotIt')}
            containerStyle={styles.h100}
        />
    );
}

export default UpgradeConfirmation;
