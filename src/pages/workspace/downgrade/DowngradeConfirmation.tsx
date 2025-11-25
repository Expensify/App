import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasOtherControlWorkspaces as hasOtherControlWorkspacesPolicyUtils} from '@libs/PolicyUtils';

type Props = {
    onConfirmDowngrade: () => void;
    policyID: string;
};

function DowngradeConfirmation({onConfirmDowngrade, policyID}: Props) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['MushroomTopHat'] as const);
    const hasOtherControlWorkspaces = hasOtherControlWorkspacesPolicyUtils(policyID);

    return (
        <ConfirmationPage
            heading={translate('workspace.downgrade.completed.headline')}
            description={hasOtherControlWorkspaces ? translate('workspace.downgrade.completed.description') : undefined}
            illustration={illustrations.MushroomTopHat}
            shouldShowButton
            onButtonPress={onConfirmDowngrade}
            buttonText={translate('workspace.downgrade.completed.gotIt')}
            containerStyle={styles.h100}
        />
    );
}

export default DowngradeConfirmation;
