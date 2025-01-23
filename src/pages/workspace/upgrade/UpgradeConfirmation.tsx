import React, {useMemo} from 'react';
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
    isTravelUpgrade?: boolean;
};

function UpgradeConfirmation({policyName, onConfirmUpgrade, isCategorizing, isTravelUpgrade}: Props) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const description = useMemo(() => {
        if (isCategorizing) {
            return translate('workspace.upgrade.completed.categorizeMessage');
        }

        if (isTravelUpgrade) {
            return translate('workspace.upgrade.completed.travelMessage');
        }

        return (
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
        );
    }, [isCategorizing, isTravelUpgrade, policyName, styles.link, translate]);

    return (
        <ConfirmationPage
            heading={translate('workspace.upgrade.completed.headline')}
            description={description}
            shouldShowButton
            onButtonPress={onConfirmUpgrade}
            buttonText={translate('workspace.upgrade.completed.gotIt')}
        />
    );
}

export default UpgradeConfirmation;
