import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Navigation from '@libs/Navigation/Navigation';
import * as Welcome from '@userActions/Welcome';
import ROUTES from '@src/ROUTES';

type OnboardEngagementScreenWrapperProps = {
    /** Child elements */
    children?: React.ReactNode;
};

function OnboardEngagementScreenWrapper({children}: OnboardEngagementScreenWrapperProps) {
    if (!Welcome.isFirstTimeNewExpensifyUser) {
        return Navigation.navigate(ROUTES.HOME);
    }

    return <FullPageNotFoundView shouldShow={!Welcome.isFirstTimeNewExpensifyUser}>{children}</FullPageNotFoundView>;
}

OnboardEngagementScreenWrapper.displayName = 'PurposeForUsingExpensifyModal';

export default OnboardEngagementScreenWrapper;
