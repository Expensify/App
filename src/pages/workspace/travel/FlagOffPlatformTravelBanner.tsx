/**
 * Banner on the workspace Travel page that points admins to Rules to flag travel booked outside Expensify Travel.
 * It stays hidden once the workspace has a rule with a travel condition.
 */
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRulesPrefetch from '@hooks/useRulesPrefetch';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {hasTravelConditionRule} from '@libs/RuleUtils';

import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type FlagOffPlatformTravelBannerProps = {
    policyID: string;
};

function FlagOffPlatformTravelBanner({policyID}: FlagOffPlatformTravelBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Flag']);
    const {areRulesLoading} = useRulesPrefetch();
    const [hasTravelFlagRule] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: (rules) => hasTravelConditionRule(rules, policyID)});

    // Wait for the rules so the banner doesn't flash for a workspace that already flags this travel
    if (areRulesLoading || hasTravelFlagRule) {
        return null;
    }

    const rulesLink = `${environmentURL}/${ROUTES.WORKSPACE_RULES.getRoute(policyID, CONST.TAB.RULES.FLAG_FOR_REVIEW)}`;
    const shouldDisplayButtonInSeparateLine = shouldUseNarrowLayout && !isInLandscapeMode;

    return (
        <BillingBanner
            icon={illustrations.Flag}
            title={translate('workspace.moreFeatures.travel.flagOffPlatformTravelBanner.title')}
            subtitle={
                <View style={[styles.mt1, styles.renderHTML]}>
                    <RenderHTML html={translate('workspace.moreFeatures.travel.flagOffPlatformTravelBanner.subtitle', rulesLink)} />
                </View>
            }
            style={[styles.borderRadiusComponentLarge, styles.mb5]}
            rightComponent={
                <View style={shouldDisplayButtonInSeparateLine ? [styles.flex0, styles.flexBasis100, styles.maxWidth100Percentage, styles.justifyContentCenter] : undefined}>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={() => Navigation.navigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID))}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.FLAG_OFF_PLATFORM_TRAVEL_TRY_IT}
                    >
                        <Button.Text>{translate('workspace.moreFeatures.travel.flagOffPlatformTravelBanner.tryIt')}</Button.Text>
                    </Button>
                </View>
            }
        />
    );
}

export default FlagOffPlatformTravelBanner;
