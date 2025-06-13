import React from 'react';
import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';
import ROUTES from '@src/ROUTES';

function SubmitTab() {
    return <ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />;
}

export default SubmitTab;
