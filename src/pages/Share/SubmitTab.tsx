import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';

import ROUTES from '@src/ROUTES';

import React from 'react';

function SubmitTabComponent() {
    return <ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />;
}

const SubmitTab = SubmitTabComponent;
export default SubmitTab;
