import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as WorkspaceRulesActions from '@userActions/Workspace/Rules';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesAutoPayReportsUnderModalForm';

type RulesAutoPayReportsUnderPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AUTO_PAY_REPORTS_UNDER>;

function RulesAutoPayReportsUnderPage({route}: RulesAutoPayReportsUnderPageProps) {
    const {policyID} = route.params;

    const {inputCallbackRef} = useAutoFocusInput();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // const defaultValue = CurrencyUtils.convertToFrontendAmountAsString(policy?.maxExpenseAmountNoReceipt, policy?.outputCurrency);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID ?? '-1'}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
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
                    // validate={validator}
                    onSubmit={({maxExpenseAutoPayAmount}) => WorkspaceRulesActions.setPolicyAutoReimbursementLimit(parseInt(maxExpenseAutoPayAmount, 10), policyID)}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            label={translate('iou.amount')}
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.MAX_EXPENSE_AUTO_PAY_AMOUNT}
                            // currency={policy?.outputCurrency ?? CONST.CURRENCY.USD}
                            currency={CurrencyUtils.getCurrencySymbol(CONST.CURRENCY.USD)}
                            // defaultValue="0"
                            isCurrencyPressable={false}
                            ref={inputCallbackRef}
                            amountMaxLength={7}
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
