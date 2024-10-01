import type {StackScreenProps} from '@react-navigation/stack';
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
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesAutoPayReportsUnderModalForm';

type RulesAutoPayReportsUnderPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AUTO_PAY_REPORTS_UNDER>;

function RulesAutoPayReportsUnderPage({route}: RulesAutoPayReportsUnderPageProps) {
    const policyID = route?.params?.policyID ?? '-1';
    const policy = usePolicy(policyID);

    const {inputCallbackRef} = useAutoFocusInput();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const currencySymbol = CurrencyUtils.getCurrencySymbol(policy?.outputCurrency ?? CONST.CURRENCY.USD);
    const autoPayApprovedReportsUnavailable = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
    const defaultValue = CurrencyUtils.convertToFrontendAmountAsString(policy?.autoReimbursement?.limit ?? CONST.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS, policy?.outputCurrency);

    const validateLimit = ({maxExpenseAutoPayAmount}: FormOnyxValues<typeof ONYXKEYS.FORMS.RULES_AUTO_PAY_REPORTS_UNDER_MODAL_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.RULES_AUTO_PAY_REPORTS_UNDER_MODAL_FORM> = {};
        if (CurrencyUtils.convertToBackendAmount(parseFloat(maxExpenseAutoPayAmount)) > CONST.POLICY.AUTO_REIMBURSEMENT_MAX_LIMIT_CENTS) {
            errors[INPUT_IDS.MAX_EXPENSE_AUTO_PAY_AMOUNT] = translate('workspace.rules.expenseReportRules.autoPayApprovedReportsLimitError', {currency: currencySymbol});
        }
        return errors;
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            shouldBeBlocked={!policy?.shouldShowAutoReimbursementLimitOption || autoPayApprovedReportsUnavailable}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={RulesAutoPayReportsUnderPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.expenseReportRules.autoPayReportsUnderTitle')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5, styles.mt5]}
                    formID={ONYXKEYS.FORMS.RULES_AUTO_PAY_REPORTS_UNDER_MODAL_FORM}
                    validate={validateLimit}
                    onSubmit={({maxExpenseAutoPayAmount}) => {
                        PolicyActions.setPolicyAutoReimbursementLimit(policyID, maxExpenseAutoPayAmount);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                    }}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            label={translate('iou.amount')}
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.MAX_EXPENSE_AUTO_PAY_AMOUNT}
                            currency={currencySymbol}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                            ref={inputCallbackRef}
                            displayAsTextInput
                        />
                        <Text style={[styles.mutedNormalTextLabel, styles.mt2]}>{translate('workspace.rules.expenseReportRules.autoPayReportsUnderDescription')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesAutoPayReportsUnderPage.displayName = 'RulesAutoPayReportsUnderPage';

export default RulesAutoPayReportsUnderPage;
