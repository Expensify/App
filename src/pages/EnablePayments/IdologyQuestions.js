import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import SingleChoiceQuestion from '@components/SingleChoiceQuestion';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';

const MAX_SKIP = 1;
const SKIP_QUESTION_TEXT = 'Skip Question';

const propTypes = {
    /** Questions returned by Idology */
    /** example: [{"answer":["1251","6253","113","None of the above","Skip Question"],"prompt":"Which number goes with your address on MASONIC AVE?","type":"street.number.b"}, ...] */
    questions: PropTypes.arrayOf(
        PropTypes.shape({
            prompt: PropTypes.string,
            type: PropTypes.string,
            answer: PropTypes.arrayOf(PropTypes.string),
        }),
    ),

    /** ID from Idology, referencing those questions */
    idNumber: PropTypes.string,

    walletAdditionalDetails: PropTypes.shape({
        /** Are we waiting for a response? */
        isLoading: PropTypes.bool,

        /** Any additional error message to show */
        errors: PropTypes.objectOf(PropTypes.string),

        /** What error do we need to handle */
        errorCode: PropTypes.string,
    }),
};

const defaultProps = {
    questions: [],
    idNumber: '',
    walletAdditionalDetails: {},
};

function IdologyQuestions({questions, idNumber}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shouldHideSkipAnswer, setShouldHideSkipAnswer] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);

    const currentQuestion = questions[currentQuestionIndex] || {};
    const possibleAnswers = _.filter(
        _.map(currentQuestion.answer, (answer) => {
            if (shouldHideSkipAnswer && answer === SKIP_QUESTION_TEXT) {
                return;
            }

            return {
                label: answer,
                value: answer,
            };
        }),
    );

    /**
     * Put question answer in the state.
     * @param {String} answer
     */
    const chooseAnswer = (answer) => {
        const tempAnswers = _.map(userAnswers, _.clone);

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
        const skippedQuestionsCount = _.filter(userAnswers, (answer) => answer.answer === SKIP_QUESTION_TEXT).length;

        // We have enough answers, let's call expectID KBA to verify them
        if (userAnswers.length - skippedQuestionsCount >= questions.length - MAX_SKIP) {
            const tempAnswers = _.map(userAnswers, _.clone);

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

    const validate = (values) => {
        const errors = {};
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
                    href="https://use.expensify.com/usa-patriot-act"
                >
                    {translate('additionalDetailsStep.helpLink')}
                </TextLink>
            </View>
            <FormProvider
                formID={ONYXKEYS.WALLET_ADDITIONAL_DETAILS}
                onSubmit={submitAnswers}
                validate={validate}
                scrollContextEnabled
                style={[styles.flexGrow1, styles.ph5]}
                submitButtonText={translate('common.saveAndContinue')}
            >
                <InputWrapper
                    InputComponent={SingleChoiceQuestion}
                    inputID="answer"
                    prompt={currentQuestion.prompt}
                    possibleAnswers={possibleAnswers}
                    currentQuestionIndex={currentQuestionIndex}
                    onValueChange={chooseAnswer}
                />
            </FormProvider>
        </View>
    );
}

IdologyQuestions.displayName = 'IdologyQuestions';
IdologyQuestions.propTypes = propTypes;
IdologyQuestions.defaultProps = defaultProps;

export default withOnyx({
    walletAdditionalDetails: {
        key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
    },
})(IdologyQuestions);
