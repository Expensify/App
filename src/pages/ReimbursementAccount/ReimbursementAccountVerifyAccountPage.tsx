import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReimbursementAccountVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT>;

function ReimbursementAccountVerifyAccountPage({route}: ReimbursementAccountVerifyAccountPageProps) {
    const {policyID, backTo} = route.params;
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, '', backTo)}
            navigateForwardTo={ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, '', backTo, CONST.BANK_ACCOUNT.STEP.COUNTRY)}
        />
    );
}

ReimbursementAccountVerifyAccountPage.displayName = 'ReimbursementAccountVerifyAccountPage';

export default ReimbursementAccountVerifyAccountPage;
