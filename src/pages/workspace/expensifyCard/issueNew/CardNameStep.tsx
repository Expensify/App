import React, {useCallback} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useEnvironment from '@hooks/useEnvironment';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCardName} from '@libs/CardUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import {getUserNameByEmail} from '@libs/PersonalDetailsUtils';
import {isPolicyFeatureEnabled} from '@libs/PolicyUtils';
import {getFieldRequiredErrors, isValidInputLength} from '@libs/ValidationUtils';
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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {inputCallbackRef} = useAutoFocusInput();
    const isInLandscapeMode = useIsInLandscapeMode();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const isEditing = issueNewCard?.isEditing;
    const data = issueNewCard?.data;
    const isVirtualCard = data?.cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL;
    const isSpendRuleAvailable = !isProduction && isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED);

    const userName = getUserNameByEmail(data?.assigneeEmail ?? '', 'firstName');
    const defaultCardTitle = !isVirtualCard ? getDefaultCardName(userName) : '';

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.CARD_TITLE], translate);
        if (values.cardTitle) {
            const {isValid, byteLength} = isValidInputLength(values.cardTitle, CONST.STANDARD_LENGTH_LIMIT);
            if (!isValid) {
                addErrorMessage(errors, INPUT_IDS.CARD_TITLE, translate('common.error.characterLimitExceedCounter', byteLength, CONST.STANDARD_LENGTH_LIMIT));
            }
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
            if (isVirtualCard || isSpendRuleAvailable) {
                setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.SPEND_RULES, policyID});
                return;
            }

            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE, policyID});
        });
    }, [isEditing, isSpendRuleAvailable, isVirtualCard, policyID]);

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
            {!isInLandscapeMode && <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.giveItName')}</Text>}
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
                {isInLandscapeMode && <Text style={[styles.textHeadlineLineHeightXXL, styles.mv3]}>{translate('workspace.card.issueNewCard.giveItName')}</Text>}
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
