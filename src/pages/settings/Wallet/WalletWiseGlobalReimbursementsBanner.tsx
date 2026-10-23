import WiseGlobalReimbursementsBanner from '@components/WiseGlobalReimbursementsBanner';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';

import {dismissProductTraining} from '@libs/actions/Welcome';
import {getWiseGlobalReimbursementsBannerBankAccountID} from '@libs/BankAccountUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DismissedProductTraining} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

const isBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER];

/** Promotes Wise global reimbursements on Wallet for the most recently added eligible bank account, until dismissed or onboarding starts */
function WalletWiseGlobalReimbursementsBanner() {
    const {pageGutterMargin, cardGapBottom} = useLayoutSpacing();
    const {isBetaEnabled} = usePermissions();
    const shouldSuppressPromotionalUI = useShouldSuppressPromotionalUI();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isDismissed = true] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: isBannerDismissedSelector});

    const bankAccountID = getWiseGlobalReimbursementsBannerBankAccountID(bankAccountList);

    if (!isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS) || shouldSuppressPromotionalUI || isDismissed || !bankAccountID) {
        return null;
    }

    return (
        <View style={[pageGutterMargin, cardGapBottom]}>
            <WiseGlobalReimbursementsBanner
                onGetStartedPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID)))}
                onDismissPress={() => dismissProductTraining(CONST.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER, true)}
                sentryLabels={CONST.SENTRY_LABEL.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER}
            />
        </View>
    );
}

export default WalletWiseGlobalReimbursementsBanner;
