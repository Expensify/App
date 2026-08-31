import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type ExpenseDefaultTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_EXPENSE_DEFAULT_TYPE>;

/**
 * Picks what an expense default matches on before the editor opens, so the editor can drop the condition and the
 * defaults the chosen type can't carry instead of showing them locked.
 */
function ExpenseDefaultTypePage({route}: ExpenseDefaultTypePageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const illustrations = useMemoizedLazyIllustrations(['FoodTruck', 'FolderOpen']);

    // A category rule only sets a default tax rate, so with taxes off there is nothing it could configure.
    const areTaxesEnabled = !!policy?.tax?.trackingEnabled;

    // Scoping rides in the draft rather than the URL, so the editor keeps it when a picker routes back to the plain
    // create URL. Setting it here also starts the rule from a clean draft.
    const openEditorScopedTo = (ruleType: 'merchant' | 'category') => {
        setDraftMerchantRule({ruleType});
        Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    const options = [
        {
            key: 'merchant',
            icon: illustrations.FoodTruck,
            title: translate('workspace.rules.expenseDefaultType.merchant'),
            description: translate('workspace.rules.expenseDefaultType.merchantDescription'),
            onPress: () => openEditorScopedTo('merchant'),
        },
        ...(areTaxesEnabled
            ? [
                  {
                      key: 'category',
                      icon: illustrations.FolderOpen,
                      title: translate('workspace.rules.expenseDefaultType.category'),
                      description: translate('workspace.rules.expenseDefaultType.categoryDescription'),
                      onPress: () => openEditorScopedTo('category'),
                  },
              ]
            : []),
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isRulesRevampEnabled}
        >
            <ScreenWrapper
                testID="ExpenseDefaultTypePage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton title={translate('workspace.rules.expenseDefaultType.title')} />
                <ScrollView
                    style={[styles.flexGrow1]}
                    addBottomSafeAreaPadding
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.rules.expenseDefaultType.subtitle')}</Text>
                    <View style={styles.mh5}>
                        {options.map((option) => (
                            <MenuItem
                                key={option.key}
                                icon={option.icon}
                                title={option.title}
                                description={option.description}
                                shouldShowRightIcon
                                onPress={option.onPress}
                                displayInDefaultIconColor
                                iconWidth={variables.iconSizeExtraLarge}
                                iconHeight={variables.iconSizeExtraLarge}
                                wrapperStyle={styles.rulesNewMenuItem}
                            />
                        ))}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ExpenseDefaultTypePage.displayName = 'ExpenseDefaultTypePage';

export default ExpenseDefaultTypePage;
