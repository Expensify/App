import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';

type CardNameStepProps = {
    /** ID of the policy */
    policyID: string;
};

function CardNameStep({policyID}: CardNameStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const isEditing = issueNewCard?.isEditing;
    const data = issueNewCard?.data;

    const userName = PersonalDetailsUtils.getUserNameByEmail(data?.assigneeEmail ?? '', 'firstName');
    const defaultCardTitle = data?.cardType !== CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL ? CardUtils.getDefaultCardName(userName) : '';

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.CARD_TITLE]);
        const length = values.cardTitle.length;
        if (length > CONST.STANDARD_LENGTH_LIMIT) {
            ErrorUtils.addErrorMessage(errors, INPUT_IDS.CARD_TITLE, translate('common.error.characterLimitExceedCounter', {length, limit: CONST.STANDARD_LENGTH_LIMIT}));
        }
        return errors;
    };

    const submit = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        Card.setIssueNewCardStepAndData({
            step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
            data: {
                cardTitle: values.cardTitle,
            },
            isEditing: false,
            policyID,
        });
    }, []);

    const handleBackButtonPress = useCallback(() => {
        if (isEditing) {
            Card.setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }
        Card.setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.LIMIT, policyID});
    }, [isEditing]);

    return (
        <InteractiveStepWrapper
            wrapperID={CardNameStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={4}
            stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.giveItName')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                onSubmit={submit}
                validate={validate}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CARD_TITLE}
                    label={translate('workspace.card.issueNewCard.cardName')}
                    hint={translate('workspace.card.issueNewCard.giveItNameInstruction')}
                    aria-label={translate('workspace.card.issueNewCard.cardName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={issueNewCard?.data?.cardTitle ?? defaultCardTitle}
                    containerStyles={[styles.mb6]}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

CardNameStep.displayName = 'CardNameStep';

export default CardNameStep;
