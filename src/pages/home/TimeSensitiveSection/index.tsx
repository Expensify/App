import React from 'react';
import {View} from 'react-native';
import WidgetContainer from '@components/WidgetContainer';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {doesUserHavePaymentCardAdded, getEarlyDiscountInfo} from '@libs/SubscriptionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Offer25off from './items/Offer25off';
import Offer50off from './items/Offer50off';

function TimeSensitiveSection() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch'] as const);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPlan = useSubscriptionPlan();

    const discountInfo = getEarlyDiscountInfo(firstDayFreeTrial);

    // Don't show offers for Team plan with 2025 pricing
    const isTeamWithNew2025Pricing = hasTeam2025Pricing && subscriptionPlan === CONST.POLICY.TYPE.TEAM;

    // Determine which offer to show (they are mutually exclusive)
    const shouldShow50off = discountInfo?.discountType === 50 && !isTeamWithNew2025Pricing;
    const shouldShow25off = discountInfo?.discountType === 25 && !doesUserHavePaymentCardAdded(userBillingFundID) && !isTeamWithNew2025Pricing;

    if (!discountInfo || (!shouldShow50off && !shouldShow25off)) {
        return null;
    }

    return (
        <WidgetContainer
            icon={icons.Stopwatch}
            iconWidth={variables.iconSizeNormal}
            iconHeight={variables.iconSizeNormal}
            iconFill={theme.danger}
            title={translate('homePage.timeSensitiveSection.title')}
            titleColor={theme.danger}
        >
            <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
                {shouldShow50off && <Offer50off firstDayFreeTrial={firstDayFreeTrial} />}
                {shouldShow25off && <Offer25off days={discountInfo.days} />}
            </View>
        </WidgetContainer>
    );
}

export default TimeSensitiveSection;
