import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesRequiredReceiptAmountForm';

type RulesReceiptRequiredAmountPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_RECEIPT_REQUIRED_AMOUNT>;

function RulesReceiptRequiredAmountPage({route}: RulesReceiptRequiredAmountPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const policy = usePolicy(route.params.policyID);

    const defaultValue =
        policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || !policy?.maxExpenseAmountNoReceipt
            ? ''
            : CurrencyUtils.convertToFrontendAmountAsString(policy?.maxExpenseAmountNoReceipt, policy?.outputCurrency);

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.RULES_REQUIRED_RECEIPT_AMOUNT_FORM>) => {
            const value = values[INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_RECEIPT];
            let amountBackend;
            if (!value) {
                amountBackend = CONST.DISABLED_MAX_EXPENSE_VALUE;
            }
            amountBackend = CurrencyUtils.convertToBackendAmount(parseFloat(values[INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_RECEIPT]));
            Policy.setPolicyMaxExpenseAmountNoReceipt(route.params.policyID, amountBackend);
            Navigation.goBack();
        },
        [route.params.policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID ?? '-1'}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={RulesReceiptRequiredAmountPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.receiptRequiredAmount')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.pt3, styles.ph5]}
                    formID={ONYXKEYS.FORMS.RULES_REQUIRED_RECEIPT_AMOUNT_FORM}
                    submitButtonText={translate('workspace.editor.save')}
                    onSubmit={submit}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            label={translate('iou.amount')}
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_RECEIPT}
                            currency={CurrencyUtils.getCurrencySymbol(policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                            ref={inputCallbackRef}
                            displayAsTextInput
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.individualExpenseRules.receiptRequiredAmountDescription')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesReceiptRequiredAmountPage.displayName = 'RulesReceiptRequiredAmountPage';

export default RulesReceiptRequiredAmountPage;
