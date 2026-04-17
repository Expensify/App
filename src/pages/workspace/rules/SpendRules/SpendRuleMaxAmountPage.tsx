import React from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftSpendRule} from '@libs/actions/User';
import {filterInactiveCards, getSelectedCardsSharedCurrency} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SpendRuleForm';
import {getParentRoute} from './SpendRulesUtils';

type SpendRuleMaxAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_MAX_AMOUNT>;

function SpendRuleMaxAmountPage({route}: SpendRuleMaxAmountPageProps) {
    const {policyID, ruleID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const domainAccountID = useDefaultFundID(policyID);
    const parentRoute = getParentRoute(policyID, ruleID);

    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const selectedCurrency = getSelectedCardsSharedCurrency(spendRuleForm?.cardIDs, cardsList) ?? CONST.CURRENCY.USD;
    const defaultValue = spendRuleForm?.maxAmount ?? '';

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="SpendRuleMaxAmountPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.spendRules.maxAmount')}
                    onBackButtonPress={() => Navigation.goBack(parentRoute)}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.SPEND_RULE_FORM}
                    onSubmit={({maxAmount}) => {
                        updateDraftSpendRule({maxAmount: maxAmount.trim()});
                        Navigation.goBack(parentRoute);
                    }}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            label={translate('iou.amount')}
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.MAX_AMOUNT}
                            currency={selectedCurrency}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                            ref={inputCallbackRef}
                            displayAsTextInput
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.spendRules.maxAmountHelp')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SpendRuleMaxAmountPage.displayName = 'SpendRuleMaxAmountPage';

export default SpendRuleMaxAmountPage;
