import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
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

type MatchTypeItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
};

function SpendRuleMerchantEditPage({route}: SpendRuleMerchantEditPageProps) {
    const {policyID, merchantIndex} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const merchants = spendRuleForm?.merchants ?? [];
    const isNew = merchantIndex === ROUTES.NEW;
    const index = isNew ? -1 : Number(merchantIndex);
    const existingMerchant = isNew ? undefined : merchants.at(index);

    const [merchantName, setMerchantName] = useState(existingMerchant?.name ?? '');
    const [matchType, setMatchType] = useState<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>(existingMerchant?.matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);

    const goBack = () => {
        Navigation.goBack(ROUTES.RULES_SPEND_MERCHANTS.getRoute(policyID));
    };

    const handleSave = () => {
        const trimmedMerchantName = merchantName.trim();
        if (!trimmedMerchantName) {
            if (!isNew) {
                const updatedMerchants = merchants.filter((_, merchantArrayIndex) => merchantArrayIndex !== index);
                updateDraftSpendRule({merchants: updatedMerchants});
            }
            goBack();
            return;
        }

        const currentMerchant: SpendRuleMerchant = {name: trimmedMerchantName, matchType};
        const updatedMerchants = isNew ? [...merchants, currentMerchant] : merchants.map((merchant, merchantArrayIndex) => (merchantArrayIndex === index ? currentMerchant : merchant));
        updateDraftSpendRule({merchants: updatedMerchants});
        goBack();
    };

    const matchTypeItems: MatchTypeItem[] = [
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            text: translate('workspace.rules.spendRules.matchTypeContains'),
            isSelected: matchType === CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        },
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            text: translate('workspace.rules.spendRules.matchTypeExact'),
            isSelected: matchType === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        },
    ];

    const onSelectMatchType = (item: MatchTypeItem) => {
        const nextMatchType = item.value;
        setMatchType(nextMatchType);

        if (isNew) {
            return;
        }

        const current = merchants.at(index);
        if (!current) {
            return;
        }

        const currentMerchants = merchants.map((merchant, merchantArrayIndex) => (merchantArrayIndex === index ? {...merchant, matchType: nextMatchType} : merchant));
        updateDraftSpendRule({merchants: currentMerchants});
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
                    onBackButtonPress={goBack}
                />
                <View style={[styles.flex1, styles.mt3]}>
                    <TextInput
                        value={merchantName}
                        onChangeText={setMerchantName}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        containerStyles={[styles.ph5]}
                    />
                    <View style={[styles.ph5, styles.pb2, styles.mt6]}>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.rules.spendRules.matchType')}</Text>
                    </View>
                    <SelectionList
                        shouldSingleExecuteRowSelect
                        data={matchTypeItems}
                        ListItem={SingleSelectListItem}
                        onSelectRow={onSelectMatchType}
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
