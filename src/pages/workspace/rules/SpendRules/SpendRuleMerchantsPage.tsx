import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {getParentRoute} from './SpendRulesUtils';

type SpendRuleMerchantsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_MERCHANTS>;

function SpendRuleMerchantsPage({route}: SpendRuleMerchantsPageProps) {
    const {policyID, ruleID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const illustrations = useMemoizedLazyIllustrations(['FoodTruck']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);

    const restrictionAction = spendRuleForm?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const merchantNames = spendRuleForm?.merchantNames ?? [];
    const merchantMatchTypes = spendRuleForm?.merchantMatchTypes ?? [];

    const emptyStateTitle =
        restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK ? translate('workspace.rules.spendRules.noBlockedMerchants') : translate('workspace.rules.spendRules.noAllowedMerchants');

    const emptyStateSubtitle =
        restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK
            ? translate('workspace.rules.spendRules.addMerchantToBlockSpend')
            : translate('workspace.rules.spendRules.addMerchantToAllowSpend');

    const goBack = () => Navigation.goBack(getParentRoute(policyID, ruleID));

    const addMerchant = () => {
        Navigation.navigate(ROUTES.RULES_SPEND_MERCHANT_EDIT.getRoute(policyID, ruleID, ROUTES.NEW));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="SpendRuleMerchantsPage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.merchant')}
                    onBackButtonPress={goBack}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <MenuItem
                        title={translate('workspace.rules.spendRules.addMerchant')}
                        icon={expensifyIcons.Plus}
                        iconHeight={20}
                        iconWidth={20}
                        titleStyle={styles.textStrong}
                        onPress={addMerchant}
                    />
                    {merchantNames.length > 0 ? (
                        merchantNames.map((merchantName, index) => (
                            <MenuItemWithTopDescription
                                // eslint-disable-next-line react/no-array-index-key
                                key={`${merchantName}-${merchantMatchTypes.at(index) ?? ''}-${index}`}
                                description={
                                    merchantMatchTypes.at(index) === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO
                                        ? translate('workspace.rules.spendRules.merchantExactlyMatches')
                                        : translate('workspace.rules.spendRules.merchantContains')
                                }
                                onPress={() => Navigation.navigate(ROUTES.RULES_SPEND_MERCHANT_EDIT.getRoute(policyID, ruleID, String(index)))}
                                shouldShowRightIcon
                                title={merchantName}
                                titleStyle={styles.flex1}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                            />
                        ))
                    ) : (
                        <BlockingView
                            icon={illustrations.FoodTruck}
                            iconHeight={68}
                            iconWidth={68}
                            title={emptyStateTitle}
                            subtitle={emptyStateSubtitle}
                            titleStyles={[styles.mb2]}
                            subtitleStyle={[styles.textSupportingNormal]}
                        />
                    )}
                </ScrollView>
                <FormAlertWithSubmitButton
                    buttonText={translate('common.save')}
                    containerStyles={[styles.m4, styles.mb5]}
                    isAlertVisible={false}
                    onSubmit={goBack}
                    enabledWhenOffline
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_SAVE}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SpendRuleMerchantsPage.displayName = 'SpendRuleMerchantsPage';

export default SpendRuleMerchantsPage;
