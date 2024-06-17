import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

type Props = {
    policyName: string;
};

function UpgradeConfirmation({policyName}: Props) {
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
                        href=""
                    >
                        {translate('workspace.upgrade.completed.viewSubscription')}
                    </TextLink>{' '}
                    {translate('workspace.upgrade.completed.moreDetails')}
                </>
            }
            shouldShowButton
            onButtonPress={() => Navigation.goBack()}
            buttonText={translate('workspace.upgrade.completed.gotIt')}
        />
    );
}

export default UpgradeConfirmation;
