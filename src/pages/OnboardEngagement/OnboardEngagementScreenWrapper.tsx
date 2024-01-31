import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Navigation from '@libs/Navigation/Navigation';
import * as Welcome from '@userActions/Welcome';
import ROUTES from '@src/ROUTES';

type OnboardEngagementScreenWrapperProps = {
    /** Child elements */
    children: React.ReactNode;
};

function OnboardEngagementScreenWrapper({children}: OnboardEngagementScreenWrapperProps) {
    const isFirstTimeNewExpensifyUser = Welcome.isFirstTimeExpensifyUser();
    if (!isFirstTimeNewExpensifyUser) {
        Navigation.navigate(ROUTES.HOME);
    }

    return <FullPageNotFoundView shouldShow={!isFirstTimeNewExpensifyUser}>{children}</FullPageNotFoundView>;
}

OnboardEngagementScreenWrapper.displayName = 'PurposeForUsingExpensifyModal';

export default OnboardEngagementScreenWrapper;
