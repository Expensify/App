import WiseGlobalReimbursementsBanner from '@components/WiseGlobalReimbursementsBanner';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';
import {getWorkspaceWiseGlobalReimbursementsBannerBankAccountID} from '@libs/BankAccountUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DismissedProductTraining} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type WorkspaceWiseGlobalReimbursementsBannerProps = {
    /** The workspace whose connected bank account the banner promotes */
    policyID: string;
};

const isBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.WISE_GLOBAL_REIMBURSEMENTS_WORKSPACE_BANNER];

/** Promotes Wise global reimbursements in Workflows > Payments for the workspace's connected bank account, until dismissed or onboarding starts */
function WorkspaceWiseGlobalReimbursementsBanner({policyID}: WorkspaceWiseGlobalReimbursementsBannerProps) {
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const shouldSuppressPromotionalUI = useShouldSuppressPromotionalUI();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isDismissed = true] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: isBannerDismissedSelector});

    const bankAccountID = getWorkspaceWiseGlobalReimbursementsBannerBankAccountID(policy, bankAccountList);

    if (!isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS) || !isPolicyAdmin(policy, currentUserLogin) || shouldSuppressPromotionalUI || isDismissed || !bankAccountID) {
        return null;
    }

    return (
        <View style={styles.mt6}>
            <WiseGlobalReimbursementsBanner
                onGetStartedPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID)))}
                onDismissPress={() => dismissProductTraining(CONST.WISE_GLOBAL_REIMBURSEMENTS_WORKSPACE_BANNER, true)}
                sentryLabels={CONST.SENTRY_LABEL.WISE_GLOBAL_REIMBURSEMENTS_WORKSPACE_BANNER}
            />
        </View>
    );
}

export default WorkspaceWiseGlobalReimbursementsBanner;
