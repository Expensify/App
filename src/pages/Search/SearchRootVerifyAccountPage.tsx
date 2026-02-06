import React from 'react';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';

function SearchRootVerifyAccountPage() {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.SEARCH_ROOT.getRoute({query: ''})} />;
}

export default SearchRootVerifyAccountPage;
