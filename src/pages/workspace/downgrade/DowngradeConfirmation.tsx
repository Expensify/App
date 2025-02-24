import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import {MushroomTopHat} from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import {hasOtherControlWorkspaces} from '@libs/PolicyUtils';

type Props = {
    onConfirmDowngrade: () => void;
    policyID: string;
};

function DowngradeConfirmation({onConfirmDowngrade, policyID}: Props) {
    const {translate} = useLocalize();

    return (
        <ConfirmationPage
            heading={translate('workspace.downgrade.completed.headline')}
            description={hasOtherControlWorkspaces(policyID) ? translate('workspace.downgrade.completed.description') : undefined}
            illustration={MushroomTopHat}
            shouldShowPrimaryButton
            onPrimaryButtonPress={onConfirmDowngrade}
            primaryButtonText={translate('workspace.downgrade.completed.gotIt')}
        />
    );
}

export default DowngradeConfirmation;
