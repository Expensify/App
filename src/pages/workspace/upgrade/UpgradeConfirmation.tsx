import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type Props = {
    policyName: string;
    policyID: string;
};

function UpgradeConfirmation({policyName, policyID}: Props) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ConfirmationPage
            heading={translate('workspace.upgrade.completed.headline')}
            description={
                <>
                    {translate('workspace.upgrade.completed.successMessage', policyName)}{' '}
                    <TextLink
                        style={styles.link}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}
                    >
                        {translate('workspace.upgrade.completed.viewSubscription')}
                    </TextLink>{' '}
                    {translate('workspace.upgrade.completed.moreDetails')}
                </>
            }
            shouldShowButton
            onButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_PROFILE.getRoute(policyID))}
            buttonText={translate('workspace.upgrade.completed.gotIt')}
        />
    );
}

export default UpgradeConfirmation;
