import Button from '@components/Button';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';
import {getWiseGlobalReimbursementsBannerBankAccountID} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';

import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DismissedProductTraining} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

const isBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER];

/** Promotes Wise global reimbursements on Wallet for the most recently added eligible bank account, until dismissed or onboarding starts */
function WiseGlobalReimbursementsBanner() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {pageGutterMargin, cardGapBottom} = useLayoutSpacing();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const shouldSuppressPromotionalUI = useShouldSuppressPromotionalUI();
    const illustrations = useMemoizedLazyIllustrations(['EarthWithCoins']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isDismissed = true] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: isBannerDismissedSelector});

    const bankAccountID = getWiseGlobalReimbursementsBannerBankAccountID(bankAccountList);

    if (!isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS) || shouldSuppressPromotionalUI || isDismissed || !bankAccountID) {
        return null;
    }

    const shouldDisplayButtonInSeparateLine = shouldUseNarrowLayout && !isInLandscapeMode;

    return (
        <View style={[pageGutterMargin, cardGapBottom]}>
            <BillingBanner
                icon={illustrations.EarthWithCoins}
                title={translate('walletPage.wiseGlobalReimbursementsBanner.title')}
                subtitle={translate('walletPage.wiseGlobalReimbursementsBanner.subtitle')}
                subtitleStyle={[styles.mt1, styles.textLabel]}
                style={styles.borderRadiusComponentLarge}
                rightIcon={expensifyIcons.Close}
                onRightIconPress={() => dismissProductTraining(CONST.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER, true)}
                rightIconAccessibilityLabel={translate('common.dismiss')}
                rightIconSentryLabel={CONST.SENTRY_LABEL.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER.DISMISS}
                rightComponent={
                    <View style={shouldDisplayButtonInSeparateLine ? [styles.flex0, styles.flexBasis100, styles.maxWidth100Percentage, styles.justifyContentCenter] : undefined}>
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID))}
                            sentryLabel={CONST.SENTRY_LABEL.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER.CTA}
                        >
                            <Button.Text>{translate('walletPage.wiseGlobalReimbursementsIntro.getStarted')}</Button.Text>
                        </Button>
                    </View>
                }
            />
        </View>
    );
}

export default WiseGlobalReimbursementsBanner;
