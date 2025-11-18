import React from 'react';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import ROUTES from '@src/ROUTES';
import BillingBanner from './BillingBanner';

function PreTrialBillingBanner() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {asset: TreasureChest} = useMemoizedLazyAsset(() => loadIllustration('TreasureChest' as IllustrationName));
    const navigateToChat = () => {
        const reportUsedForOnboarding = ReportUtils.getChatUsedForOnboarding();

        if (!reportUsedForOnboarding) {
            Report.navigateToConciergeChat();
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
            icon={TreasureChest}
        />
    );
}

PreTrialBillingBanner.displayName = 'PreTrialBillingBanner';

export default PreTrialBillingBanner;
