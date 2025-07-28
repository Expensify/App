import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getChatUsedForOnboarding} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BillingBanner from './BillingBanner';

function PreTrialBillingBanner() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});

    const navigateToChat = () => {
        const reportUsedForOnboarding = getChatUsedForOnboarding();

        if (!reportUsedForOnboarding) {
            navigateToConciergeChat(reportNameValuePairs);
            return;
        }

        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportUsedForOnboarding.reportID));
    };

    return (
        <BillingBanner
            title={translate('subscription.billingBanner.preTrial.title')}
            subtitle={
                <Text>
                    {translate('subscription.billingBanner.preTrial.subtitleStart')}
                    <TextLink
                        style={styles.link}
                        onPress={navigateToChat}
                    >
                        {translate('subscription.billingBanner.preTrial.subtitleLink')}
                    </TextLink>
                    {translate('subscription.billingBanner.preTrial.subtitleEnd')}
                </Text>
            }
            icon={Illustrations.TreasureChest}
        />
    );
}

PreTrialBillingBanner.displayName = 'PreTrialBillingBanner';

export default PreTrialBillingBanner;
