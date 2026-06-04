import React, {useCallback} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import MissingPersonalDetailsContent from './MissingPersonalDetailsContent';

function MissingPersonalDetails({route: {params: {cardID = ''} = {}}}) {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, draftValuesMetadata);

    const handleComplete = useCallback(() => {
        Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE.getRoute(cardID));
    }, [cardID]);

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
        />
    );
}

export default MissingPersonalDetails;
