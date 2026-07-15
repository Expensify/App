import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useCallback} from 'react';

import MissingPersonalDetailsContent from './MissingPersonalDetailsContent';

function MissingPersonalDetails({route: {params: {cardID = ''} = {}}}) {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);

    // Base path of the entry screen (the URL without the missing-personal-details suffix), used to build
    // dynamic routes that keep the correct screen underneath the RHP.
    const basePath = useDynamicBackPath(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.path);

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, draftValuesMetadata);

    const handleComplete = useCallback(() => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE.getRoute(cardID), basePath), {forceReplace: true});
    }, [cardID, basePath]);

    if (isLoading) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'MissingPersonalDetails'};
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <MissingPersonalDetailsContent
            privatePersonalDetails={privatePersonalDetails}
            draftValues={draftValues}
            onComplete={handleComplete}
            cardID={cardID}
            basePath={basePath}
        />
    );
}

export default MissingPersonalDetails;
