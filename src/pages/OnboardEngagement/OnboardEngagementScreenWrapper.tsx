import React, {useEffect} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import * as Welcome from '@userActions/Welcome';
import ROUTES from '@src/ROUTES';
import Navigation from '@libs/Navigation/Navigation';

type OnboardEngagementScreenWrapperProps = {
    /** Child elements */
    children?: React.ReactNode;
};

function OnboardEngagementScreenWrapper({children}: OnboardEngagementScreenWrapperProps) {
    useEffect(() => {
        if (!Welcome.isFirstTimeNewExpensifyUser ){
            Navigation.navigate(ROUTES.HOME)
        }
    }, []);

    return <FullPageNotFoundView shouldShow={!Welcome.isFirstTimeNewExpensifyUser}>{children}</FullPageNotFoundView>;
}

OnboardEngagementScreenWrapper.displayName = 'PurposeForUsingExpensifyModal';

export default OnboardEngagementScreenWrapper;
