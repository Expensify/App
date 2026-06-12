import React from 'react';
import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';
import ROUTES from '@src/ROUTES';

function SubmitTabComponent() {
    return <ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />;
}

const SubmitTab = SubmitTabComponent;
export default SubmitTab;
