import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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
    const illustrations = useMemoizedLazyIllustrations(['TreasureChest'] as const);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const navigateToChat = () => {
        const reportUsedForOnboarding = getChatUsedForOnboarding();

        if (!reportUsedForOnboarding) {
            navigateToConciergeChat(personalDetails);
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
            icon={illustrations.TreasureChest}
        />
    );
}

PreTrialBillingBanner.displayName = 'PreTrialBillingBanner';

export default PreTrialBillingBanner;
