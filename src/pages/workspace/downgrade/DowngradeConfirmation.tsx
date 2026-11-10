import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

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
    const illustrations = useMemoizedLazyIllustrations(['MushroomTopHat']);
    const {login} = useCurrentUserPersonalDetails();
    const selector = (policies: OnyxCollection<Policy>) => {
        return activeAdminPoliciesSelector(policies, login ?? '');
    };
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    const hasOtherControlWorkspaces = hasOtherControlWorkspacesPolicyUtils(adminPolicies, policyID);

    return (
        <ConfirmationPage>
            <ConfirmationPage.Content>
                <ConfirmationPage.Illustration illustration={illustrations.MushroomTopHat} />
                <ConfirmationPage.Heading>{translate('workspace.downgrade.completed.headline')}</ConfirmationPage.Heading>
                {hasOtherControlWorkspaces && <ConfirmationPage.Description>{translate('workspace.downgrade.completed.description')}</ConfirmationPage.Description>}
            </ConfirmationPage.Content>
            <FixedFooter>
                <ConfirmationPage.PrimaryButton
                    text={translate('workspace.downgrade.completed.gotIt')}
                    onPress={onConfirmDowngrade}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default DowngradeConfirmation;
