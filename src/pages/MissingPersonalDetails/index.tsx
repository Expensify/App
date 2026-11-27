import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

import MissingPersonalDetailsContent from './MissingPersonalDetailsContent';

function MissingPersonalDetails({route: {params: {cardID = ''} = {}}}) {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);

    // Base path of the entry screen (the URL without the missing-personal-details suffix), used to build
    // dynamic routes that keep the correct screen underneath the RHP.
    const basePath = useDynamicBackPath(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.path);

    const handleComplete = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE.getRoute(cardID), basePath), {forceReplace: true});
    };

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
