import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import {formatSubscriptionEndDate} from '@pages/settings/Subscription/utils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type RenewSubscriptionProps = {
    /** Date-only string of the day the annual subscription lapses */
    endDate: string | undefined;
};

function RenewSubscription({endDate}: RenewSubscriptionProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid']);

    return (
        <BaseWidgetItem
            sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM.RENEW_SUBSCRIPTION}
            buttonSentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM_BUTTON.RENEW_SUBSCRIPTION}
            icon={icons.CalendarSolid}
            title={translate('homePage.timeSensitiveSection.renewSubscription.title')}
            subtitle={translate('homePage.timeSensitiveSection.renewSubscription.subtitle', {date: formatSubscriptionEndDate(endDate, dateFnsLocale)})}
            ctaText={translate('homePage.timeSensitiveSection.renewSubscription.cta')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS)}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default RenewSubscription;
