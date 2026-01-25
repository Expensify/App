import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCardName} from '@libs/CardUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import {getUserNameByEmail} from '@libs/PersonalDetailsUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import {setIssueNewCardStepAndData} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import KeyboardUtils from '@src/utils/keyboard';

type CardNameStepProps = {
    /** ID of the policy */
    policyID: string | undefined;

    /** Array of step names */
    stepNames: readonly string[];

    /** Start from step index */
    startStepIndex: number;
};

function CardNameStep({policyID, stepNames, startStepIndex}: CardNameStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();

    const isEditing = issueNewCard?.isEditing;
    const data = issueNewCard?.data;
    const isVirtualCard = data?.cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL;

    const userName = getUserNameByEmail(data?.assigneeEmail ?? '', 'firstName');
    const defaultCardTitle = !isVirtualCard ? getDefaultCardName(userName) : '';

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.CARD_TITLE]);
        const length = values.cardTitle.length;
        if (length > CONST.STANDARD_LENGTH_LIMIT) {
            addErrorMessage(errors, INPUT_IDS.CARD_TITLE, translate('common.error.characterLimitExceedCounter', length, CONST.STANDARD_LENGTH_LIMIT));
        }
        return errors;
    };

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
            KeyboardUtils.dismiss().then(() => {
                setIssueNewCardStepAndData({
                    step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
                    data: {
                        cardTitle: values.cardTitle,
                    },
                    isEditing: false,
                    policyID,
                });
            });
        },
        [policyID],
    );

    const handleBackButtonPress = useCallback(() => {
        KeyboardUtils.dismiss().then(() => {
            if (isEditing) {
                setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
                return;
            }
            setIssueNewCardStepAndData({
                step: isBetaEnabled(CONST.BETAS.SINGLE_USE_AND_EXPIRE_BY_CARDS) && isVirtualCard ? CONST.EXPENSIFY_CARD.STEP.EXPIRY_OPTIONS : CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE,
                policyID,
            });
        });
    }, [isEditing, isBetaEnabled, isVirtualCard, policyID]);

    return (
        <InteractiveStepWrapper
            wrapperID="CardNameStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.giveItName')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                onSubmit={submit}
                validate={validate}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                addBottomSafeAreaPadding
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

export default CardNameStep;
