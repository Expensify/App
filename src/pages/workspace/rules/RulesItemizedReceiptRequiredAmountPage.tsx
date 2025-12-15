import React from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyMaxExpenseAmountNoItemizedReceipt} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesRequiredItemizedReceiptAmountForm';

type RulesItemizedReceiptRequiredAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT>;

function RulesItemizedReceiptRequiredAmountPage({
    route: {
        params: {policyID},
    },
}: RulesItemizedReceiptRequiredAmountPageProps) {
    const policy = usePolicy(policyID);

    const {inputCallbackRef} = useAutoFocusInput();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultValue =
        policy?.maxExpenseAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || !policy?.maxExpenseAmountNoItemizedReceipt
            ? ''
            : convertToFrontendAmountAsString(policy?.maxExpenseAmountNoItemizedReceipt, policy?.outputCurrency);

    const validate = (
        values: FormOnyxValues<typeof ONYXKEYS.FORMS.RULES_REQUIRED_ITEMIZED_RECEIPT_AMOUNT_FORM>,
    ): FormInputErrors<typeof ONYXKEYS.FORMS.RULES_REQUIRED_ITEMIZED_RECEIPT_AMOUNT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.RULES_REQUIRED_ITEMIZED_RECEIPT_AMOUNT_FORM> = {};
        const maxExpenseAmountNoItemizedReceipt = values.maxExpenseAmountNoItemizedReceipt;

        if (maxExpenseAmountNoItemizedReceipt) {
            const maxExpenseAmountNoItemizedReceiptInCents = convertToBackendAmount(parseFloat(maxExpenseAmountNoItemizedReceipt));
            const maxExpenseAmountNoReceipt = policy?.maxExpenseAmountNoReceipt ?? 0;

            // Check if itemized receipt amount is lower than regular receipt amount
            if (maxExpenseAmountNoReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE && maxExpenseAmountNoItemizedReceiptInCents < maxExpenseAmountNoReceipt) {
                errors.maxExpenseAmountNoItemizedReceipt = translate('workspace.rules.individualExpenseRules.itemizedReceiptRequiredAmountError', {
                    amount: convertToFrontendAmountAsString(maxExpenseAmountNoReceipt, policy?.outputCurrency),
                });
            }
        }

        return errors;
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={RulesItemizedReceiptRequiredAmountPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.itemizedReceiptRequiredAmount')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.RULES_REQUIRED_ITEMIZED_RECEIPT_AMOUNT_FORM}
                    onSubmit={({maxExpenseAmountNoItemizedReceipt}) => {
                        setPolicyMaxExpenseAmountNoItemizedReceipt(policyID, maxExpenseAmountNoItemizedReceipt);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                    validate={validate}
                    submitButtonText={translate('workspace.editor.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            label={translate('iou.amount')}
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT}
                            currency={policy?.outputCurrency ?? CONST.CURRENCY.USD}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                            ref={inputCallbackRef}
                            displayAsTextInput
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.individualExpenseRules.itemizedReceiptRequiredAmountDescription')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesItemizedReceiptRequiredAmountPage.displayName = 'RulesItemizedReceiptRequiredAmountPage';

export default RulesItemizedReceiptRequiredAmountPage;
