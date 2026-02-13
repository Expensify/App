import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MissingPersonalDetailsParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import MissingPersonalDetailsContent from './MissingPersonalDetailsContent';

function MissingPersonalDetails() {
    const route = useRoute<PlatformStackRouteProp<MissingPersonalDetailsParamList, typeof SCREENS.MISSING_PERSONAL_DETAILS>>();
    const cardID = route.params?.cardID;

    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT, {canBeMissing: true});

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, draftValuesMetadata);

    const handleComplete = useCallback(() => {
        Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE.getRoute(cardID));
    }, [cardID]);

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
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
