import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import {setTravelProvisioningNextStep} from '@libs/actions/Travel';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const {domain, backTo, policyID} = route.params;
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING, {canBeMissing: true});

    useEffect(() => {
        return () => {
            setTravelProvisioningNextStep();
        };
    }, []);

    // Determine where to navigate after successful OTP validation
    const navigateForwardTo = travelProvisioning?.nextStepRoute ?? ROUTES.TRAVEL_TCS.getRoute(domain, policyID);

    return (
        <VerifyAccountPageBase
            navigateBackTo={backTo}
            navigateForwardTo={navigateForwardTo}
        />
    );
}

VerifyAccountPage.displayName = 'VerifyAccountPage';
export default VerifyAccountPage;
