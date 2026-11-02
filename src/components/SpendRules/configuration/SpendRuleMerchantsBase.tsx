import React from 'react';
import type {ValueOf} from 'type-fest';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCanWriteCardSpendRules from '@hooks/useCanWriteCardSpendRules';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

type SpendRuleMerchantsBaseProps = {
    policyID: string;
    action: string;
    merchantNames: string[];
    merchantMatchTypes: Array<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>;
    getEditMerchantRoute: (merchantIndex: string) => Route;
};

function SpendRuleMerchantsBase({policyID, action, merchantMatchTypes, merchantNames, getEditMerchantRoute}: SpendRuleMerchantsBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const illustrations = useMemoizedLazyIllustrations(['FoodTruck']);
    const canWriteCardSpendRules = useCanWriteCardSpendRules(policyID);

    const emptyStateTitle =
        action === CONST.SPEND_RULES.ACTION.BLOCK ? translate('workspace.rules.spendRules.noBlockedMerchants') : translate('workspace.rules.spendRules.noAllowedMerchants');

    const emptyStateSubtitle =
        action === CONST.SPEND_RULES.ACTION.BLOCK ? translate('workspace.rules.spendRules.addMerchantToBlockSpend') : translate('workspace.rules.spendRules.addMerchantToAllowSpend');

    const goBack = () => {
        Navigation.goBack();
    };

    const navigateToMerchantEdit = (merchantIndex: string) => {
        Navigation.navigate(getEditMerchantRoute(merchantIndex));
    };

    const addMerchant = () => {
        navigateToMerchantEdit(ROUTES.NEW);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            shouldBeBlocked={!canWriteCardSpendRules}
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
                                onPress={() => navigateToMerchantEdit(String(index))}
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

export default SpendRuleMerchantsBase;
