import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import {getDiscountTimeRemaining} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BillingBanner from './BillingBanner';

function EarlyDiscountBanner({timeRemainingProp}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [timeRemaining, setTimeRemaining] = useState(timeRemainingProp);
    const discountType = useMemo(() => (timeRemaining < CONST.DATE.SECONDS_PER_DAY ? 50 : 25), [timeRemaining]);

    useEffect(() => {
        const intervalID = setInterval(() => {
            setTimeRemaining(getDiscountTimeRemaining(firstDayFreeTrial));
        }, 1000);

        return () => clearInterval(intervalID);
    }, [firstDayFreeTrial]);

    const title = (
        <Text style={[styles.textStrong]}>
            Limited time offer:
            <Text>&nbsp;50% off your first year!</Text>
        </Text>
    );

    const formatTimeRemaining = useCallback(() => {
        if (timeRemaining.days === 0) {
            return `Claim within ${timeRemaining.hours}h : ${timeRemaining.minutes}m : ${timeRemaining.seconds}s`;
        }
        return `Claim within ${timeRemaining.days}d : ${timeRemaining.hours}h : ${timeRemaining.minutes}m : ${timeRemaining.seconds}s`;
    }, [timeRemaining]);

    return (
        <BillingBanner
            title={title}
            subtitle={formatTimeRemaining()}
            subtitleStyle={[styles.mt1, styles.mutedNormalTextLabel]}
            icon={Illustrations.TreasureChest}
        />
    );
}

EarlyDiscountBanner.displayName = 'PreTrialBillingBanner';

export default EarlyDiscountBanner;
