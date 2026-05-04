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
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SpendRuleMaxAmountForm';

type SpendRuleMaxAmountBaseProps = {
    policyID: string;
    maxAmount: string;
    currencyCode: string;
    onMaxAmountChange: (maxAmount: string) => void;
};

function SpendRuleMaxAmountBase({policyID, maxAmount, currencyCode, onMaxAmountChange}: SpendRuleMaxAmountBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const goBack = () => {
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="SpendRuleMaxAmountPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.spendRules.maxAmount')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.SPEND_RULE_MAX_AMOUNT_FORM}
                    onSubmit={({maxAmount}) => {
                        onMaxAmountChange(maxAmount.trim());
                        goBack();
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
                            currency={currencyCode}
                            defaultValue={maxAmount}
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

export default SpendRuleMaxAmountBase;
