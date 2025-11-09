import React from 'react';
import {View} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
import RenderHTML from '@components/RenderHTML';
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
                <View style={styles.renderHTML}>
                    <RenderHTML
                        html={translate('subscription.billingBanner.preTrial.subtitle')}
                        onLinkPress={navigateToChat}
                    />
                </View>
            }
            icon={Illustrations.TreasureChest}
        />
    );
}

PreTrialBillingBanner.displayName = 'PreTrialBillingBanner';

export default PreTrialBillingBanner;
