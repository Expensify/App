import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import {MushroomTopHat} from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import * as PolicyUtils from '@libs/PolicyUtils';

type Props = {
    onConfirmDowngrade: () => void;
    policyID: string;
};

function UpgradeConfirmation({onConfirmDowngrade, policyID}: Props) {
    const {translate} = useLocalize();
    const hasOtherControlWorkspace = PolicyUtils.hasOtherControlWorkspace(policyID);

    return (
        <ConfirmationPage
            heading={translate('workspace.downgrade.completed.headline')}
            description={hasOtherControlWorkspace ? translate('workspace.downgrade.completed.description') : undefined}
            illustration={MushroomTopHat}
            shouldShowButton
            onButtonPress={onConfirmDowngrade}
            buttonText={translate('workspace.downgrade.completed.gotIt')}
        />
    );
}

export default UpgradeConfirmation;
