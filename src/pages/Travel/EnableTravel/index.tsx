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
    // Deliberately not blocking on travelProvisioning's own loading metadata here (unlike the two above) — it's
    // a plain optional session key with no guaranteed write on account creation, so gating the whole screen on
    // it hydrating can leave this stuck on the loading indicator.
    // trade-off given a real step transition only happens well after the previous step's write has settled.
    const [travelProvisioning] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING);

    if (isLoadingOnyxValue(privatePersonalDetailsMetadata, accountMetadata)) {
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
