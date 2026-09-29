import useDynamicBackPath from '@hooks/useDynamicBackPath';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useNavigationState} from '@react-navigation/native';
import React from 'react';

type DynamicReimbursementAccountVerifyAccountPageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.DYNAMIC_REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT>;

type ReimbursementAccountParams = ReimbursementAccountNavigatorParamList[typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT];

function DynamicReimbursementAccountVerifyAccountPage({route}: DynamicReimbursementAccountVerifyAccountPageProps) {
    const {policyID, setupType, isNonUSDSetup} = route.params ?? {};
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.BANK_ACCOUNT_VERIFY_ACCOUNT.path);
    // backTo of the entry screen below, passed on like prepareNextStep does
    const backTo = useNavigationState(
        (state) => (state.routes.findLast((stackRoute) => stackRoute.name === SCREENS.REIMBURSEMENT_ACCOUNT)?.params as ReimbursementAccountParams | undefined)?.backTo,
    );

    // Read from the route, not REIMBURSEMENT_ACCOUNT_OPTION_PRESSED: the entry point resets that key on validation
    let navigateForwardTo;
    if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL && isNonUSDSetup === 'true') {
        navigateForwardTo = ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.CURRENCY_AND_COUNTRY, backTo});
    } else if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL || setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
        navigateForwardTo = ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: CONST.BANK_ACCOUNT.PAGE_NAMES.COUNTRY, backTo});
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={navigateForwardTo}
        />
    );
}

export default DynamicReimbursementAccountVerifyAccountPage;
