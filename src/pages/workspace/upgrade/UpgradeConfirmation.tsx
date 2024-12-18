import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type Props = {
    policyName: string;
    onConfirmUpgrade: () => void;
    isCategorizing?: boolean;
};

function UpgradeConfirmation({policyName, onConfirmUpgrade, isCategorizing}: Props) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ConfirmationPage
            heading={translate('workspace.upgrade.completed.headline')}
            description={
                isCategorizing ? (
                    translate('workspace.upgrade.completed.categorizeMessage')
                ) : (
                    <>
                        {translate('workspace.upgrade.completed.successMessage', {policyName})}{' '}
                        <TextLink
                            style={styles.link}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION)}
                        >
                            {translate('workspace.upgrade.completed.viewSubscription')}
                        </TextLink>{' '}
                        {translate('workspace.upgrade.completed.moreDetails')}
                    </>
                )
            }
            shouldShowButton
            onButtonPress={onConfirmUpgrade}
            buttonText={translate('workspace.upgrade.completed.gotIt')}
        />
    );
}

export default UpgradeConfirmation;
