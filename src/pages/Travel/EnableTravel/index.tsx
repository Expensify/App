import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {setTravelProvisioningNextStep} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect} from 'react';

import EnableTravelContent from './EnableTravelContent';

type EnableTravelProps = PlatformStackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.ENABLE>;

function EnableTravel({route}: EnableTravelProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);
    const [travelProvisioning, travelProvisioningMetadata] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING);

    // travelProvisioning's loading metadata only gates mid-flow mounts (URL already has a subPage), not the
    // flow-entry mount. Entry mounts recompute and overwrite the persisted step list anyway, and gating them on
    // an optional session key with no guaranteed write could stick them on the loading indicator. Mid-flow the
    // gate is required: steps like tax ID and domain selector merge into TRAVEL_PROVISIONING in the same tick as
    // the forward navigation, and useOnyx treats a first connection with a pending merge on the key as
    // "loading" (value undefined). Without the gate, the new mount would freeze a freshly recomputed — and
    // wrong — step list and persist it over the real one, shrinking the stepper mid-flow.
    const isMidFlowMount = !!route.params.subPage;
    const isUserValidated = account?.validated ?? false;

    // Verify account is a gate in front of the whole stepper, not a numbered step in it: redirect there first
    // (forceReplace so it doesn't linger in navigation history) whenever the account isn't validated yet,
    // including on a direct/deep link into a later step, since nothing in this flow should be reachable before
    // validation. setTravelProvisioningNextStep tells VerifyAccountPage where to forward-navigate back to once
    // validated, which re-triggers the redirect-to-first-step logic in EnableTravelContent.
    useEffect(() => {
        if (isLoadingOnyxValue(accountMetadata) || isUserValidated) {
            return;
        }
        setTravelProvisioningNextStep(ROUTES.TRAVEL_ENABLE.getRoute(policyID));
        Navigation.navigate(ROUTES.TRAVEL_VERIFY_ACCOUNT.getRoute(undefined, policyID), {forceReplace: true});
    }, [isUserValidated, accountMetadata, policyID]);

    if (isLoadingOnyxValue(privatePersonalDetailsMetadata, accountMetadata) || !isUserValidated || (isMidFlowMount && isLoadingOnyxValue(travelProvisioningMetadata))) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'EnableTravel'};
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <AccessOrNotFoundWrapper policyID={policyID}>
            <EnableTravelContent
                policy={policy}
                policyID={policyID}
                account={account}
                privatePersonalDetails={privatePersonalDetails}
                travelProvisioning={travelProvisioning}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default EnableTravel;
