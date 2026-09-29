import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useNavigationState} from '@react-navigation/native';
import React from 'react';

type DynamicReimbursementAccountVerifyAccountPageProps = PlatformStackScreenProps<ReimbursementAccountNavigatorParamList, typeof SCREENS.DYNAMIC_REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT>;

type ReimbursementAccountParams = ReimbursementAccountNavigatorParamList[typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT];

function DynamicReimbursementAccountVerifyAccountPage({route}: DynamicReimbursementAccountVerifyAccountPageProps) {
    const {policyID, isNonUSDSetup} = route.params ?? {};
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.BANK_ACCOUNT_VERIFY_ACCOUNT.path);
    const [reimbursementAccountOptionPressed] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT_OPTION_PRESSED);
    // The entry screen sits below this page in the same stack. Hand its backTo on to the setup flow, as prepareNextStep does for validated users.
    const backTo = useNavigationState(
        (state) => (state.routes.findLast((stackRoute) => stackRoute.name === SCREENS.REIMBURSEMENT_ACCOUNT)?.params as ReimbursementAccountParams | undefined)?.backTo,
    );

    // VerifiedBankAccountFlowEntryPoint decides between the USD and non-USD flows and passes the result in isNonUSDSetup.
    let navigateForwardTo;
    if (reimbursementAccountOptionPressed === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL && isNonUSDSetup === 'true') {
        navigateForwardTo = ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: CONST.NON_USD_BANK_ACCOUNT.PAGE_NAME.CURRENCY_AND_COUNTRY, backTo});
    } else if (reimbursementAccountOptionPressed === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL || reimbursementAccountOptionPressed === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
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
