import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MissingPersonalDetailsParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

import MissingPersonalDetailsContent from './MissingPersonalDetailsContent';

type MissingPersonalDetailsProps = PlatformStackScreenProps<MissingPersonalDetailsParamList, typeof SCREENS.DYNAMIC_MISSING_PERSONAL_DETAILS>;

function MissingPersonalDetails({
    route: {
        params: {cardID = '', walletEnrollmentID},
    },
}: MissingPersonalDetailsProps) {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);

    // Base path of the entry screen (the URL without the missing-personal-details suffix), used to build
    // dynamic routes that keep the correct screen underneath the RHP.
    const basePath = useDynamicBackPath(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.path);

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, draftValuesMetadata);

    const handleComplete = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE.getRoute(cardID, walletEnrollmentID), basePath), {forceReplace: true});
    };

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <MissingPersonalDetailsContent
            privatePersonalDetails={privatePersonalDetails}
            draftValues={draftValues}
            onComplete={handleComplete}
            cardID={cardID}
            basePath={basePath}
            walletEnrollmentID={walletEnrollmentID}
        />
    );
}

export default MissingPersonalDetails;
