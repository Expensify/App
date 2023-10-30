import PropTypes from 'prop-types';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormScrollView from '@components/FormScrollView';
import OfflineIndicator from '@components/OfflineIndicator';
import RadioButtons from '@components/RadioButtons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import * as ErrorUtils from '@libs/ErrorUtils';
import styles from '@styles/styles';
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

function IdologyQuestions({questions, walletAdditionalDetails, idNumber}) {
    const formRef = useRef();
    const {translate} = useLocalize();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shouldHideSkipAnswer, setShouldHideSkipAnswer] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [error, setError] = useState('');

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
    const errorMessage = ErrorUtils.getLatestErrorMessage(walletAdditionalDetails) || error;

    /**
     * Put question answer in the state.
     * @param {String} answer
     */
    const chooseAnswer = (answer) => {
        const tempAnswers = _.map(userAnswers, _.clone);

        tempAnswers[currentQuestionIndex] = {question: currentQuestion.type, answer};

        setUserAnswers(tempAnswers);
        setError('');
    };

    /**
     * Show next question or send all answers for Idology verifications when we've answered enough
     */
    const submitAnswers = () => {
        if (!userAnswers[currentQuestionIndex]) {
            setError(translate('additionalDetailsStep.selectAnswer'));
        } else {
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
        }
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
            <FormScrollView ref={formRef}>
                <View
                    style={styles.m5}
                    key={currentQuestion.type}
                >
                    <Text style={[styles.textStrong, styles.mb5]}>{currentQuestion.prompt}</Text>
                    <RadioButtons
                        items={possibleAnswers}
                        key={currentQuestionIndex}
                        onPress={chooseAnswer}
                    />
                </View>
            </FormScrollView>
            <FixedFooter>
                <FormAlertWithSubmitButton
                    isAlertVisible={Boolean(errorMessage)}
                    onSubmit={submitAnswers}
                    onFixTheErrorsLinkPressed={() => {
                        formRef.current.scrollTo({y: 0, animated: true});
                    }}
                    message={errorMessage}
                    isLoading={walletAdditionalDetails.isLoading}
                    buttonText={translate('common.saveAndContinue')}
                    containerStyles={[styles.mh0, styles.mv0, styles.mb0]}
                />
                <OfflineIndicator containerStyles={[styles.mh5, styles.mb3]} />
            </FixedFooter>
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
