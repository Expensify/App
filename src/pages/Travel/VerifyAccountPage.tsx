import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {requestTravelAccess, setTravelProvisioningNextStep} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const {domain, backTo, policyID} = route.params;
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();

    useEffect(() => {
        return () => {
            setTravelProvisioningNextStep();
        };
    }, []);

    const isTravelVerifiedBetaEnabled = isBetaEnabled(CONST.BETAS.IS_TRAVEL_VERIFIED);

    // Determine where to navigate after successful OTP validation
    const navigateForwardTo = isTravelVerifiedBetaEnabled ? (travelProvisioning?.nextStepRoute ?? ROUTES.TRAVEL_TCS.getRoute(domain ?? '', policyID)) : undefined;

    const handleClose = useCallback(() => {
        requestTravelAccess();
        Navigation.goBack(backTo);
    }, [backTo]);

    return (
        <VerifyAccountPageBase
            navigateBackTo={backTo}
            navigateForwardTo={navigateForwardTo}
            handleClose={!isTravelVerifiedBetaEnabled ? handleClose : undefined}
        />
    );
}

export default VerifyAccountPage;
