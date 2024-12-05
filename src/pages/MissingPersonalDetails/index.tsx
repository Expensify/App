import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import MissingPersonalDetailsContent from './MissingPersonalDetailsContent';

function MissingPersonalDetails() {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, draftValuesMetadata);

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <MissingPersonalDetailsContent
            privatePersonalDetails={privatePersonalDetails}
            draftValues={draftValues}
        />
    );
}

MissingPersonalDetails.displayName = 'MissingPersonalDetails';

export default MissingPersonalDetails;
