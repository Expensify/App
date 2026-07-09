import {requestTravelAccess} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import type SCREENS from '@src/SCREENS';

import type {StackScreenProps} from '@react-navigation/stack';

import React, {useCallback} from 'react';

type VerifyAccountPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const {backTo} = route.params;

    const handleValidationSuccess = useCallback(() => {
        requestTravelAccess();
    }, []);

    const handleClose = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    return (
        <VerifyAccountPageBase
            navigateBackTo={backTo}
            handleClose={handleClose}
            onValidationSuccess={handleValidationSuccess}
        />
    );
}

export default VerifyAccountPage;
