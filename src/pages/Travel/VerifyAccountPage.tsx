import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.TRAVEL_MY_TRIPS}
            navigateForwardTo={ROUTES.TRAVEL_TCS.getRoute(route.params.domain)}
        />
    );
}

VerifyAccountPage.displayName = 'VerifyAccountPage';
export default VerifyAccountPage;
