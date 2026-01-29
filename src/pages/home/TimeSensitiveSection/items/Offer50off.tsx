import React, {useEffect, useState} from 'react';
import TreasureChest from '@assets/images/treasure-chest.svg';
import BaseWidgetItem from '@components/BaseWidgetItem';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getEarlyDiscountInfo} from '@libs/SubscriptionUtils';
import ROUTES from '@src/ROUTES';

type Offer50offProps = {
    firstDayFreeTrial: string | undefined;
};

function Offer50off({firstDayFreeTrial}: Offer50offProps) {
    const theme = useTheme();
    const {translate} = useLocalize();

    const [discountInfo, setDiscountInfo] = useState(() => getEarlyDiscountInfo(firstDayFreeTrial));

    useEffect(() => {
        const intervalID = setInterval(() => {
            setDiscountInfo(getEarlyDiscountInfo(firstDayFreeTrial));
        }, 1000);

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
            icon={TreasureChest}
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
