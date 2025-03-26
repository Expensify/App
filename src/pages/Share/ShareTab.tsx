import React from 'react';
import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';
import ROUTES from '@src/ROUTES';

function ShareTab() {
    return <ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_DETAILS} />;
}

export default ShareTab;
