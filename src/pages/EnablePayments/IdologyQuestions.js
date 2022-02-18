import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
} from 'react-native';
import RadioButtons from '../../components/RadioButtons';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';
import FormScrollView from '../../components/FormScrollView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';

const MAX_SKIP = 1;
const SKIP_QUESTION_TEXT = 'Skip Question';

const propTypes = {
    ...withLocalizePropTypes,

    /** Questions returned by Idology */
    /** example: [{"answer":["1251","6253","113","None of the above","Skip Question"],"prompt":"Which number goes with your address on MASONIC AVE?","type":"street.number.b"}, ...] */
    questions: PropTypes.arrayOf(PropTypes.shape({
        prompt: PropTypes.string,
        type: PropTypes.string,
        answer: PropTypes.arrayOf(PropTypes.string),
    })),

    /** ID from Idology, referencing those questions */
    idNumber: PropTypes.string,
};

const defaultProps = {
    questions: [],
    idNumber: '',
};

class IdologyQuestions extends React.Component {
    constructor(props) {
        super(props);
        this.submitAnswers = this.submitAnswers.bind(this);

        this.state = {
            /** Current question index to display. */
            questionNumber: 0,

            /** Should we hide the "Skip question" answer? Yes if the user already skipped MAX_SKIP questions. */
            hideSkip: false,

            /** Answers from the user */
            answers: [],

            /** Any error message */
            errorMessage: '',

            /** Did the user just submitted all his answers? */
            isLoading: false,
        };
    }

    /**
     * Put question answer in the state.
     * @param {Number} questionIndex
     * @param {String} answer
     */
    chooseAnswer(questionIndex, answer) {
        this.setState((prevState) => {
            const answers = prevState.answers;
            const question = this.props.questions[questionIndex];
            answers[questionIndex] = {question: question.type, answer};
            return {
                answers,
                errorMessage: '',
            };
        });
    }

    /**
     * Show next question or send all answers for Idology verifications when we've answered enough
     */
    submitAnswers() {
        this.setState((prevState) => {
            // User must pick an answer
            if (!prevState.answers[prevState.questionNumber]) {
                return {
                    errorMessage: this.props.translate('additionalDetailsStep.selectAnswer'),
                };
            }

            // Get the number of questions that were skipped by the user.
            const skippedQuestionsCount = _.filter(prevState.answers, answer => answer.answer === SKIP_QUESTION_TEXT).length;

            // We have enough answers, let's call expectID KBA to verify them
            if ((prevState.answers.length - skippedQuestionsCount) >= (this.props.questions.length - MAX_SKIP)) {
                const answers = prevState.answers;

                // Auto skip any remaining questions
                if (answers.length < this.props.questions.length) {
                    for (let i = answers.length; i < this.props.questions.length; i++) {
                        answers[i] = {question: this.props.questions[i].type, answer: SKIP_QUESTION_TEXT};
                    }
                }

                BankAccounts.activateWallet(CONST.WALLET.STEP.ADDITIONAL_DETAILS, {
                    idologyAnswers: {
                        answers,
                        idNumber: this.props.idNumber,
                    },
                });
                return {answers, isLoading: true};
            }

            // Else, show next question
            return {
                questionNumber: prevState.questionNumber + 1,
                hideSkip: skippedQuestionsCount >= MAX_SKIP,
            };
        });
    }

    render() {
        const questionIndex = this.state.questionNumber;
        const question = this.props.questions[questionIndex] || {};
        const possibleAnwers = _.filter(_.map(question.answer, (answer) => {
            if (this.state.hideSkip && answer === SKIP_QUESTION_TEXT) {
                return;
            }

            return {
                label: answer,
                value: answer,
            };
        }));

        return (
            <View style={[styles.flex1]}>
                <View style={[styles.ph5]}>
                    <Text style={styles.mb3}>{this.props.translate('additionalDetailsStep.helpTextIdologyQuestions')}</Text>
                    <TextLink
                        style={styles.mb3}
                        href="https://use.expensify.com/usa-patriot-act"
                    >
                        {this.props.translate('additionalDetailsStep.helpLink')}
                    </TextLink>
                </View>
                <FormScrollView ref={el => this.form = el}>
                    <View style={[styles.mh5, styles.mb5, styles.mt5]} key={question.type}>
                        <Text style={[styles.textStrong, styles.mb5]}>{question.prompt}</Text>
                        <RadioButtons
                            items={possibleAnwers}
                            onPress={answer => this.chooseAnswer(questionIndex, answer)}
                        />
                    </View>

                    <FormAlertWithSubmitButton
                        isAlertVisible={Boolean(this.state.errorMessage)}
                        onSubmit={this.submitAnswers}
                        onFixTheErrorsLinkPressed={() => {
                            this.form.scrollTo({y: 0, animated: true});
                        }}
                        message={this.state.errorMessage}
                        isLoading={this.state.isLoading}
                        buttonText={this.props.translate('common.saveAndContinue')}
                    />
                </FormScrollView>
            </View>
        );
    }
}

IdologyQuestions.propTypes = propTypes;
IdologyQuestions.defaultProps = defaultProps;
export default withLocalize(IdologyQuestions);
