import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';

function CardNameStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [issueNewCard] = useOnyx(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD);

    const isEditing = issueNewCard?.isEditing;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.CARD_TITLE]);
            if (!values.cardTitle) {
                errors.cardTitle = translate('common.error.fieldRequired');
            }
            return errors;
        },
        [translate],
    );

    const submit = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        Card.setIssueNewCardStepAndData({
            step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
            data: {
                cardTitle: values.cardTitle,
            },
            isEditing: false,
        });
    }, []);

    const handleBackButtonPress = useCallback(() => {
        if (isEditing) {
            Card.setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false});
            return;
        }
        Card.setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.LIMIT});
    }, [isEditing]);

    return (
        <ScreenWrapper
            testID={CardNameStep.displayName}
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
                    startStepIndex={4}
                    stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.giveItName')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                // TODO: change the submitButtonText to 'common.confirm' when editing and navigate to ConfirmationStep
                submitButtonText={translate('common.next')}
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
                    // TODO: default value for card name
                    defaultValue={issueNewCard?.data?.cardTitle}
                    containerStyles={[styles.mb6]}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

CardNameStep.displayName = 'CardNameStep';

export default CardNameStep;
