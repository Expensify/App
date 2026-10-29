import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

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

    const updateSubscriptionLink = () => {
        const backTo = Navigation.getActiveRoute();
        setSubscriptionLink(`${environmentURL}/${ROUTES.SETTINGS_SUBSCRIPTION.getRoute(backTo)}`);
    };

    useEffect(() => {
        Navigation.isNavigationReady().then(() => updateSubscriptionLink());
    }, [updateSubscriptionLink]);

    let description;
    if (isCategorizing || isReporting) {
        description = <Text style={[styles.textAlignCenter, styles.w100]}>{translate('workspace.upgrade.completed.categorizeMessage')}</Text>;
    } else if (isTravelUpgrade) {
        description = <Text style={[styles.textAlignCenter, styles.w100]}>{translate('workspace.upgrade.completed.travelMessage')}</Text>;
    } else if (isDistanceRateUpgrade) {
        description = <Text style={[styles.textAlignCenter, styles.w100]}>{translate('workspace.upgrade.completed.distanceRateMessage')}</Text>;
    } else {
        description = (
            <View style={[styles.renderHTML, styles.w100]}>
                <RenderHTML html={translate('workspace.upgrade.completed.successMessage', policyName, planName ?? translate('workspace.type.control'), subscriptionLink)} />
            </View>
        );
    }

    const heading = isCategorizing || isReporting ? translate('workspace.upgrade.completed.createdWorkspace') : translate('workspace.upgrade.completed.headline');

    return (
        <ConfirmationPage>
            <ConfirmationPage.Content>
                <ConfirmationPage.Illustration />
                <ConfirmationPage.Heading>{heading}</ConfirmationPage.Heading>
                {description}
            </ConfirmationPage.Content>
            <FixedFooter>
                <ConfirmationPage.PrimaryButton
                    text={buttonText ?? translate('workspace.upgrade.completed.gotIt')}
                    onPress={afterUpgradeAcknowledged}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default UpgradeConfirmation;
