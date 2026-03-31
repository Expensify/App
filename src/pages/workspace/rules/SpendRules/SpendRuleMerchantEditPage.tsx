import React, {useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftSpendRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SpendRuleMerchant} from '@src/types/form/SpendRuleForm';

type SpendRuleMerchantEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_MERCHANT_EDIT>;

function getMatchTypeLabel(matchType: SpendRuleMerchant['matchType'], translate: ReturnType<typeof useLocalize>['translate']) {
    if (matchType === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO) {
        return translate('workspace.rules.spendRules.matchTypeExact');
    }
    return translate('workspace.rules.spendRules.matchTypeContains');
}

function SpendRuleMerchantEditPage({route}: SpendRuleMerchantEditPageProps) {
    const {policyID, merchantIndex} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const merchants = spendRuleForm?.merchants ?? [];
    const index = Number(merchantIndex);
    const existingMerchant = merchants.at(index);

    const [merchantName, setMerchantName] = useState(existingMerchant?.name ?? '');

    const matchType = existingMerchant?.matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;

    const goBack = (shouldRemoveIfEmpty = true) => {
        const currentMerchant = merchants.at(index);
        if (shouldRemoveIfEmpty && currentMerchant && !currentMerchant.name.trim()) {
            const nextMerchants = merchants.filter((_, idx) => idx !== index);
            updateDraftSpendRule({merchants: nextMerchants});
        }
        Navigation.goBack(ROUTES.RULES_SPEND_MERCHANTS.getRoute(policyID));
    };

    const handleSave = () => {
        const trimmed = merchantName.trim();
        if (!trimmed) {
            goBack(true);
            return;
        }

        const nextMerchant: SpendRuleMerchant = {name: trimmed, matchType};
        const nextMerchants = merchants.map((m, idx) => (idx === index ? nextMerchant : m));
        updateDraftSpendRule({merchants: nextMerchants});
        goBack(false);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="SpendRuleMerchantEditPage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.merchant')}
                    onBackButtonPress={() => goBack(true)}
                />
                <View style={[styles.flex1, styles.mt5]}>
                    <TextInput
                        value={merchantName}
                        onChangeText={setMerchantName}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        containerStyles={[styles.ph5, styles.mb5]}
                    />
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.spendRules.matchType')}
                        title={getMatchTypeLabel(matchType, translate)}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.RULES_SPEND_MERCHANT_MATCH_TYPE.getRoute(policyID, merchantIndex))}
                    />
                </View>
                <FormAlertWithSubmitButton
                    buttonText={translate('common.save')}
                    containerStyles={[styles.m4, styles.mb5]}
                    isAlertVisible={false}
                    onSubmit={handleSave}
                    enabledWhenOffline
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SpendRuleMerchantEditPage.displayName = 'SpendRuleMerchantEditPage';

export default SpendRuleMerchantEditPage;
