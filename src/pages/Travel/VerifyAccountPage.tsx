import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {requestTravelAccess, setTravelProvisioningNextStep} from '@libs/actions/Travel';
import getTravelAcceptTermsRoute from '@libs/getTravelAcceptTermsRoute';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type {StackScreenProps} from '@react-navigation/stack';

import React, {useEffect} from 'react';

type VerifyAccountPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const {backTo, policyID} = route.params;
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING);
    const {isBetaEnabled} = usePermissions();

    useEffect(() => {
        return () => {
            setTravelProvisioningNextStep();
        };
    }, []);

    const isTravelVerifiedBetaEnabled = isBetaEnabled(CONST.BETAS.IS_TRAVEL_VERIFIED);

    // Determine where to navigate after successful OTP validation
    const defaultForwardRoute = policyID ? getTravelAcceptTermsRoute(policyID) : undefined;
    const navigateForwardTo = isTravelVerifiedBetaEnabled ? (travelProvisioning?.nextStepRoute ?? defaultForwardRoute) : undefined;

    return (
        <VerifyAccountPageBase
            navigateBackTo={backTo}
            navigateForwardTo={navigateForwardTo}
            onValidationSuccess={!isTravelVerifiedBetaEnabled ? requestTravelAccess : undefined}
        />
    );
}

export default VerifyAccountPage;
