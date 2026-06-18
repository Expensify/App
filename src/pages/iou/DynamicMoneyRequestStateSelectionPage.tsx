import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import StateSelectionPage from '@pages/settings/Profile/PersonalDetails/StateSelectionPage';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicMoneyRequestStateSelectionPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STATE_SELECTOR.path);

    return <StateSelectionPage backTo={backPath} />;
}

export default DynamicMoneyRequestStateSelectionPage;
