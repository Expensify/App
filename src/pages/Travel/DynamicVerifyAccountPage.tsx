import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {setTravelProvisioningNextStep} from '@libs/actions/Travel';
import getTravelAcceptTermsRoute from '@libs/getTravelAcceptTermsRoute';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {StackScreenProps} from '@react-navigation/stack';

import React, {useEffect} from 'react';

type DynamicVerifyAccountPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.DYNAMIC_VERIFY_ACCOUNT>;

function DynamicVerifyAccountPage({route}: DynamicVerifyAccountPageProps) {
    const {policyID} = route.params ?? {};
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TRAVEL_VERIFY_ACCOUNT.path);
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
            navigateBackTo={backPath}
            navigateForwardTo={navigateForwardTo}
        />
    );
}

export default DynamicVerifyAccountPage;
