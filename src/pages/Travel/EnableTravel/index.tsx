import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

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

    if (isLoadingOnyxValue(privatePersonalDetailsMetadata, accountMetadata) || (isMidFlowMount && isLoadingOnyxValue(travelProvisioningMetadata))) {
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
