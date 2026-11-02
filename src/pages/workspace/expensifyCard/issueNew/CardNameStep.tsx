import AutoGrowHeightInputContainer from '@components/AutoGrowHeightInputContainer';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCardNameError, getCardNameErrorMessage, getDefaultCardName} from '@libs/CardUtils';
import {isPolicyFeatureEnabled} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';

import {setIssueNewCardStepAndData} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import KeyboardUtils from '@src/utils/keyboard';

import React from 'react';

type CardNameStepProps = {
    policyID: string | undefined;
    stepNames: readonly string[];
    startStepIndex: number;
};

function CardNameStep({policyID, stepNames, startStepIndex}: CardNameStepProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput(true);
    const isInLandscapeMode = useIsInLandscapeMode();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const isEditing = issueNewCard?.isEditing;
    const data = issueNewCard?.data;
    const userName = usePersonalDetailByLogin(data?.assigneeEmail, (personalDetail) => {
        return formatPhoneNumber(personalDetail?.firstName || data?.assigneeEmail || '');
    });
    const isVirtualCard = data?.cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL;
    const areSpendRulesAvailable = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED, policyCategories);

    const defaultCardTitle = !isVirtualCard ? getDefaultCardName(userName) : '';

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> = {};
        const error = getCardNameError(values.cardTitle);

        if (error) {
            errors[INPUT_IDS.CARD_TITLE] = getCardNameErrorMessage(translate, error, values.cardTitle);
        }

        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        KeyboardUtils.dismiss().then(() => {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
                data: {
                    cardTitle: StringUtils.sanitizeName(values.cardTitle),
                },
                isEditing: false,
                policyID,
            });
        });
    };

    const handleBackButtonPress = () => {
        KeyboardUtils.dismiss().then(() => {
            if (isEditing) {
                setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
                return;
            }
            if (isVirtualCard || areSpendRulesAvailable) {
                setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.SPEND_RULES, policyID});
                return;
            }

            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE, policyID});
        });
    };

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
                shouldConstrainWebContentHeight
                submitFlexEnabled={false}
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                onSubmit={(values) => submit({...values, [INPUT_IDS.CARD_TITLE]: StringUtils.lineBreaksToSpaces(values[INPUT_IDS.CARD_TITLE])})}
                validate={(values) => validate({...values, [INPUT_IDS.CARD_TITLE]: StringUtils.lineBreaksToSpaces(values[INPUT_IDS.CARD_TITLE])})}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                addBottomSafeAreaPadding
            >
                {isInLandscapeMode && <Text style={[styles.textHeadlineLineHeightXXL, styles.mv3]}>{translate('workspace.card.issueNewCard.giveItName')}</Text>}
                <AutoGrowHeightInputContainer shouldKeepMinimumHeight>
                    {(maxAutoGrowHeight) => (
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
                            maxAutoGrowHeight={maxAutoGrowHeight}
                            autoGrowSingleLine
                        />
                    )}
                </AutoGrowHeightInputContainer>
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default CardNameStep;
