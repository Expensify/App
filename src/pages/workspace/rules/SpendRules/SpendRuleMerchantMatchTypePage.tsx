import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
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

type SpendRuleMerchantMatchTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_MERCHANT_MATCH_TYPE>;

type MatchTypeItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
};

function SpendRuleMerchantMatchTypePage({route}: SpendRuleMerchantMatchTypePageProps) {
    const {policyID, merchantIndex} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const merchants = spendRuleForm?.merchants ?? [];
    const index = Number(merchantIndex);
    const existingMerchant = merchants.at(index);

    const selectedValue = existingMerchant?.matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;

    const goBack = useCallback(() => Navigation.goBack(ROUTES.RULES_SPEND_MERCHANT_EDIT.getRoute(policyID, merchantIndex)), [policyID, merchantIndex]);

    const items: MatchTypeItem[] = [
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            text: translate('workspace.rules.spendRules.matchTypeContains'),
            isSelected: selectedValue === CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        },
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            text: translate('workspace.rules.spendRules.matchTypeExact'),
            isSelected: selectedValue === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        },
    ];

    const onSelectItem = (item: MatchTypeItem) => {
        const nextMatchType = item.value;
        const current = merchants.at(index);
        if (!current) {
            goBack();
            return;
        }

        const nextMerchant: SpendRuleMerchant = {...current, matchType: nextMatchType};
        const nextMerchants = merchants.map((m, idx) => (idx === index ? nextMerchant : m));
        updateDraftSpendRule({merchants: nextMerchants});
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="SpendRuleMerchantMatchTypePage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.spendRules.matchType')}
                    onBackButtonPress={goBack}
                />
                <View style={[styles.flex1]}>
                    <SelectionList
                        shouldSingleExecuteRowSelect
                        data={items}
                        ListItem={SingleSelectListItem}
                        onSelectRow={onSelectItem}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SpendRuleMerchantMatchTypePage.displayName = 'SpendRuleMerchantMatchTypePage';

export default SpendRuleMerchantMatchTypePage;
