import ConfirmationPage from '@components/ConfirmationPage';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasOtherControlWorkspaces as hasOtherControlWorkspacesPolicyUtils} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {activeAdminPoliciesSelector} from '@selectors/Policy';
import React from 'react';

type Props = {
    onConfirmDowngrade: () => void;
    policyID: string;
};

function DowngradeConfirmation({onConfirmDowngrade, policyID}: Props) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['MushroomTopHat']);
    const {login} = useCurrentUserPersonalDetails();
    const selector = (policies: OnyxCollection<Policy>) => {
        return activeAdminPoliciesSelector(policies, login ?? '');
    };
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    const hasOtherControlWorkspaces = hasOtherControlWorkspacesPolicyUtils(adminPolicies, policyID);

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
