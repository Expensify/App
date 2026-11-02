import React from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SubscriptionPlanDowngradeBlocked from '@components/SubscriptionPlanDowngradeBlocked';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import {formatSubscriptionEndDate} from '@pages/settings/Subscription/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicSubscriptionPlanDowngradeBlockedPage() {
    const {translate} = useLocalize();
    const backTo = useDynamicBackPath(DYNAMIC_ROUTES.SUBSCRIPTION_DOWNGRADE_BLOCKED.path);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const formattedSubscriptionEndDate = formatSubscriptionEndDate(privateSubscription?.endDate);
    const onClosePress = () => {
        Navigation.goBack(backTo);
    };
    return (
        <ScreenWrapper
            testID="DynamicSubscriptionPlanDowngradeBlockedPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('workspace.common.planType')}
                    onBackButtonPress={onClosePress}
                />
                <SubscriptionPlanDowngradeBlocked
                    privateSubscription={privateSubscription}
                    formattedSubscriptionEndDate={formattedSubscriptionEndDate}
                    onClosePress={onClosePress}
                />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default DynamicSubscriptionPlanDowngradeBlockedPage;
