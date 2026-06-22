import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type RulesNewPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_NEW>;

function RulesNewPage({route}: RulesNewPageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const illustrations = useMemoizedLazyIllustrations(['CardReaderAlt', 'ReportReceipt']);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isRulesRevampEnabled}
        >
            <ScreenWrapper testID="RulesNewPage">
                <HeaderWithBackButton title={translate('workspace.rules.newRule.title')} />
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.rules.newRule.subtitle')}</Text>
                <View style={styles.mh5}>
                    <MenuItem
                        icon={illustrations.CardReaderAlt}
                        title={translate('workspace.rules.newRule.restrictCardSpend')}
                        description={translate('workspace.rules.newRule.restrictCardSpendDescription')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID))}
                        displayInDefaultIconColor
                        iconWidth={variables.iconSizeExtraLarge}
                        iconHeight={variables.iconSizeExtraLarge}
                        wrapperStyle={styles.rulesNewMenuItem}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM}
                    />
                    <MenuItem
                        icon={illustrations.ReportReceipt}
                        title={translate('workspace.rules.newRule.applyExpenseDefaults')}
                        description={translate('workspace.rules.newRule.applyExpenseDefaultsDescription')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID))}
                        displayInDefaultIconColor
                        iconWidth={variables.iconSizeExtraLarge}
                        iconHeight={variables.iconSizeExtraLarge}
                        wrapperStyle={styles.rulesNewMenuItem}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesNewPage;
