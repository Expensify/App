import Button from '@components/Button';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import {formatSubscriptionEndDate} from '@pages/settings/Subscription/utils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import BillingBanner from './BillingBanner';

type SubscriptionExpiringSoonBannerProps = {
    /** Date-only string of the day the annual subscription lapses */
    endDate: string | undefined;
};

function SubscriptionExpiringSoonBanner({endDate}: SubscriptionExpiringSoonBannerProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['SubscriptionAnnual']);

    return (
        <BillingBanner
            title={translate('subscription.billingBanner.subscriptionExpiringSoon.title', {date: formatSubscriptionEndDate(endDate, dateFnsLocale)})}
            subtitle={translate('subscription.billingBanner.subscriptionExpiringSoon.subtitle')}
            icon={illustrations.SubscriptionAnnual}
            rightComponent={
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS)}
                >
                    <Button.Text>{translate('subscription.billingBanner.subscriptionExpiringSoon.manage')}</Button.Text>
                </Button>
            }
        />
    );
}

export default SubscriptionExpiringSoonBanner;
