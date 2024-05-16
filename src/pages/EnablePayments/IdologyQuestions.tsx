import React, {useState} from 'react';
import {View} from 'react-native';
import type {WalletAdditionalQuestionDetails} from 'src/types/onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {Choice} from '@components/RadioButtons';
import SingleChoiceQuestion from '@components/SingleChoiceQuestion';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

const MAX_SKIP = 1;
const SKIP_QUESTION_TEXT = 'Skip Question';

type IdologyQuestionsProps = {
    /** Questions returned by Idology */
    /** example: [{"answer":["1251","6253","113","None of the above","Skip Question"],"prompt":"Which number goes with your address on MASONIC AVE?","type":"street.number.b"}, ...] */
    questions: WalletAdditionalQuestionDetails[];

    /** ID from Idology, referencing those questions */
    idNumber: string;
};

type Answer = {
    question: string;
    answer: string;
};

function IdologyQuestions({questions, idNumber}: IdologyQuestionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shouldHideSkipAnswer, setShouldHideSkipAnswer] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Answer[]>([]);

    const currentQuestion = questions[currentQuestionIndex] || {};
    const possibleAnswers: Choice[] = currentQuestion.answer
        .map((answer) => {
            if (shouldHideSkipAnswer && answer === SKIP_QUESTION_TEXT) {
                return;
            }

            return {
                label: answer,
                value: answer,
            };
        })
        .filter((answer): answer is Choice => answer !== undefined);

    const chooseAnswer = (answer: string) => {
        const tempAnswers: Answer[] = userAnswers.map((userAnswer) => ({...userAnswer}));

        tempAnswers[currentQuestionIndex] = {question: currentQuestion.type, answer};

        setUserAnswers(tempAnswers);
    };

    /**
     * Show next question or send all answers for Idology verifications when we've answered enough
     */
    const submitAnswers = () => {
        if (!userAnswers[currentQuestionIndex]) {
            return;
        }
        // Get the number of questions that were skipped by the user.
        const skippedQuestionsCount = userAnswers.filter((answer) => answer.answer === SKIP_QUESTION_TEXT).length;

        // We have enough answers, let's call expectID KBA to verify them
        if (userAnswers.length - skippedQuestionsCount >= questions.length - MAX_SKIP) {
            const tempAnswers: Answer[] = userAnswers.map((answer) => ({...answer}));

            // Auto skip any remaining questions
            if (tempAnswers.length < questions.length) {
                for (let i = tempAnswers.length; i < questions.length; i++) {
                    tempAnswers[i] = {question: questions[i].type, answer: SKIP_QUESTION_TEXT};
                }
            }

            BankAccounts.answerQuestionsForWallet(tempAnswers, idNumber);
            setUserAnswers(tempAnswers);
        } else {
            // Else, show next question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShouldHideSkipAnswer(skippedQuestionsCount >= MAX_SKIP);
        }
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
        const errors: Errors = {};
        if (!values.answer) {
            errors.answer = translate('additionalDetailsStep.selectAnswer');
        }
        return errors;
    };

    return (
        <View style={styles.flex1}>
            <View style={styles.ph5}>
                <Text style={styles.mb3}>{translate('additionalDetailsStep.helpTextIdologyQuestions')}</Text>
                <TextLink
                    style={styles.mb3}
                    href={CONST.HELP_LINK_URL}
                >
                    {translate('additionalDetailsStep.helpLink')}
                </TextLink>
            </View>
            <FormProvider
                formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
                onSubmit={submitAnswers}
                key={currentQuestionIndex}
                validate={validate}
                scrollContextEnabled
                style={[styles.flexGrow1, styles.ph5]}
                submitButtonText={translate('common.saveAndContinue')}
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={SingleChoiceQuestion}
                    inputID="answer"
                    prompt={currentQuestion.prompt}
                    possibleAnswers={possibleAnswers}
                    currentQuestionIndex={currentQuestionIndex}
                    onValueChange={(value) => {
                        chooseAnswer(String(value));
                    }}
                    onInputChange={() => {}}
                />
            </FormProvider>
        </View>
    );
}

IdologyQuestions.displayName = 'IdologyQuestions';

export default IdologyQuestions;
