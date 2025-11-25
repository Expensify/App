import React from 'react';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getChatUsedForOnboarding} from '@libs/ReportUtils';
import ROUTES from '@src/ROUTES';
import BillingBanner from './BillingBanner';

function PreTrialBillingBanner() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['TreasureChest'] as const);
    const navigateToChat = () => {
        const reportUsedForOnboarding = getChatUsedForOnboarding();

        if (!reportUsedForOnboarding) {
            navigateToConciergeChat();
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
            icon={illustrations.TreasureChest}
        />
    );
}

PreTrialBillingBanner.displayName = 'PreTrialBillingBanner';

export default PreTrialBillingBanner;
