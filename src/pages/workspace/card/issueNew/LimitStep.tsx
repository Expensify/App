import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';

function LimitStep() {
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const [issueNewCard] = useOnyx(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD);

    const submit = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        const limit = CurrencyUtils.convertToBackendAmount(Number(values?.limit) ?? 0);
        Card.setIssueNewCardStepAndData(CONST.EXPENSIFY_CARD.STEP.CARD_NAME, {limit});
    }, []);

    const handleBackButtonPress = useCallback(() => {
        Card.setIssueNewCardStepAndData(CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE);
    }, []);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.LIMIT]);
            if (!Number(values.limit)) {
                errors.limit = translate('iou.error.invalidAmount');
            }
            return errors;
        },
        [translate],
    );

    return (
        <ScreenWrapper
            testID={LimitStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.card.issueCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={3}
                    stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.setLimit')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                // TODO: change the submitButtonText to 'common.confirm' when editing and navigate to ConfirmationStep
                submitButtonText={translate('common.next')}
                onSubmit={submit}
                style={[styles.flex1]}
                submitButtonStyles={[styles.mh5, styles.mt0]}
                submitFlexEnabled={false}
                enabledWhenOffline
                validate={validate}
            >
                <InputWrapper
                    InputComponent={AmountForm}
                    defaultValue={CurrencyUtils.convertToFrontendAmountAsString(issueNewCard?.data?.limit, false)}
                    isCurrencyPressable={false}
                    inputID={INPUT_IDS.LIMIT}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

LimitStep.displayName = 'LimitStep';

export default LimitStep;
