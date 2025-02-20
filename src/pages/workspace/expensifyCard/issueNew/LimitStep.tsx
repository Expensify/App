import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';

type LimitStepProps = {
    /** ID of the policy */
    policyID: string | undefined;
};

function LimitStep({policyID}: LimitStepProps) {
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);
    const isEditing = issueNewCard?.isEditing;

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
            const limit = convertToBackendAmount(Number(values?.limit));
            setIssueNewCardStepAndData({
                step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.CARD_NAME,
                data: {limit},
                isEditing: false,
                policyID,
            });
        },
        [isEditing, policyID],
    );

    const handleBackButtonPress = useCallback(() => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE, policyID});
    }, [isEditing, policyID]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
            const errors = getFieldRequiredErrors(values, [INPUT_IDS.LIMIT]);

            // We only want integers to be sent as the limit
            if (!Number(values.limit)) {
                errors.limit = translate('iou.error.invalidAmount');
            } else if (!Number.isInteger(Number(values.limit))) {
                errors.limit = translate('iou.error.invalidIntegerAmount');
            }

            if (Number(values.limit) > CONST.EXPENSIFY_CARD.LIMIT_VALUE) {
                errors.limit = translate('workspace.card.issueNewCard.cardLimitError');
            }
            return errors;
        },
        [translate],
    );

    return (
        <InteractiveStepWrapper
            wrapperID={LimitStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={3}
            stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.setLimit')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                shouldHideFixErrorsAlert
                onSubmit={submit}
                style={[styles.flex1]}
                submitButtonStyles={[styles.mh5, styles.mt0]}
                submitFlexEnabled={false}
                disablePressOnEnter={false}
                validate={validate}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={AmountForm}
                    defaultValue={convertToFrontendAmountAsString(issueNewCard?.data?.limit, CONST.CURRENCY.USD, false)}
                    isCurrencyPressable={false}
                    inputID={INPUT_IDS.LIMIT}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

LimitStep.displayName = 'LimitStep';

export default LimitStep;
