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
