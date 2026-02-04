import React, {useEffect, useState} from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getEarlyDiscountInfo} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type Offer50offProps = {
    firstDayFreeTrial: string | undefined;
};

function Offer50off({firstDayFreeTrial}: Offer50offProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['TreasureChest'] as const);

    const [discountInfo, setDiscountInfo] = useState(() => getEarlyDiscountInfo(firstDayFreeTrial));

    useEffect(() => {
        const intervalID = setInterval(() => {
            setDiscountInfo(getEarlyDiscountInfo(firstDayFreeTrial));
        }, CONST.MILLISECONDS_PER_SECOND);

        return () => clearInterval(intervalID);
    }, [firstDayFreeTrial]);

    if (!discountInfo) {
        return null;
    }

    const {hours, minutes, seconds} = discountInfo;
    const formattedTime = DateUtils.formatCountdownTimer(translate, hours, minutes, seconds);
    const subtitle = translate('homePage.timeSensitiveSection.offer50off.subtitle', {formattedTime});

    return (
        <BaseWidgetItem
            icon={icons.TreasureChest}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.offer50off.title')}
            subtitle={subtitle}
            ctaText={translate('homePage.timeSensitiveSection.cta')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.getRoute(ROUTES.HOME))}
        />
    );
}

export default Offer50off;
