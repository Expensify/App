import React from 'react';
import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';
import ROUTES from '@src/ROUTES';

function SubmitTab() {
    const isTabFocused = useTabNavigatorFocus({tabIndex: 1});

    return (
        <ShareTabParticipantsSelector
            detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS}
            textInputAutoFocus={isTabFocused}
        />
    );
}

export default SubmitTab;
