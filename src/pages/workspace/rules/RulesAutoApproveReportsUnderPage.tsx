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
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getWorkflowApprovalsUnavailable} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyAutomaticApprovalLimit} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/RulesAutoApproveReportsUnderModalForm';

type RulesAutoApproveReportsUnderPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AUTO_APPROVE_REPORTS_UNDER>;

function RulesAutoApproveReportsUnderPage({route}: RulesAutoApproveReportsUnderPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);

    const {inputCallbackRef} = useAutoFocusInput();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const workflowApprovalsUnavailable = getWorkflowApprovalsUnavailable(policy);
    const defaultValue = convertToFrontendAmountAsString(policy?.autoApproval?.limit ?? CONST.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS, policy?.outputCurrency);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            shouldBeBlocked={!policy?.shouldShowAutoApprovalOptions || workflowApprovalsUnavailable}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RulesAutoApproveReportsUnderPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.expenseReportRules.autoApproveReportsUnderTitle')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.RULES_AUTO_APPROVE_REPORTS_UNDER_MODAL_FORM}
                    onSubmit={({maxExpenseAutoApprovalAmount}) => {
                        setPolicyAutomaticApprovalLimit(policyID, maxExpenseAutoApprovalAmount);
                        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
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
                            inputID={INPUT_IDS.MAX_EXPENSE_AUTO_APPROVAL_AMOUNT}
                            currency={policy?.outputCurrency ?? CONST.CURRENCY.USD}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                            ref={inputCallbackRef}
                            displayAsTextInput
                        />
                        <Text style={[styles.mutedNormalTextLabel, styles.mt2]}>{translate('workspace.rules.expenseReportRules.autoApproveReportsUnderDescription')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesAutoApproveReportsUnderPage;
