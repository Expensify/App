import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import {requestTravelAccess, setTravelProvisioningNextStep} from '@libs/actions/Travel';
import getTravelAcceptTermsRoute from '@libs/getTravelAcceptTermsRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const {domain, backTo, policyID} = route.params;
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING);
    const policy = usePolicy(policyID);
    const {isBetaEnabled} = usePermissions();

    useEffect(() => {
        return () => {
            setTravelProvisioningNextStep();
        };
    }, []);

    const isTravelVerifiedBetaEnabled = isBetaEnabled(CONST.BETAS.IS_TRAVEL_VERIFIED);

    // Determine where to navigate after successful OTP validation
    const defaultForwardRoute = domain ? getTravelAcceptTermsRoute(domain, policyID, policy) : undefined;
    const navigateForwardTo = isTravelVerifiedBetaEnabled ? (travelProvisioning?.nextStepRoute ?? defaultForwardRoute) : undefined;

    const handleValidationSuccess = useCallback(() => {
        requestTravelAccess();
    }, []);

    const handleClose = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    return (
        <VerifyAccountPageBase
            navigateBackTo={backTo}
            navigateForwardTo={navigateForwardTo}
            handleClose={!isTravelVerifiedBetaEnabled ? handleClose : undefined}
            onValidationSuccess={!isTravelVerifiedBetaEnabled ? handleValidationSuccess : undefined}
        />
    );
}

export default VerifyAccountPage;
