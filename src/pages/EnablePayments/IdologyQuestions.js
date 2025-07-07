"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var SingleChoiceQuestion_1 = require("@components/SingleChoiceQuestion");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccounts = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MAX_SKIP = 1;
var SKIP_QUESTION_TEXT = 'Skip Question';
function IdologyQuestions(_a) {
    var _b, _c;
    var questions = _a.questions, idNumber = _a.idNumber;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, react_1.useState)(0), currentQuestionIndex = _d[0], setCurrentQuestionIndex = _d[1];
    var _e = (0, react_1.useState)(false), shouldHideSkipAnswer = _e[0], setShouldHideSkipAnswer = _e[1];
    var _f = (0, react_1.useState)([]), userAnswers = _f[0], setUserAnswers = _f[1];
    var currentQuestion = (_b = questions.at(currentQuestionIndex)) !== null && _b !== void 0 ? _b : {};
    var possibleAnswers = currentQuestion.answer
        .map(function (answer) {
        if (shouldHideSkipAnswer && answer === SKIP_QUESTION_TEXT) {
            return;
        }
        return {
            label: answer,
            value: answer,
        };
    })
        .filter(function (answer) { return answer !== undefined; });
    var chooseAnswer = function (answer) {
        var tempAnswers = userAnswers.map(function (userAnswer) { return (__assign({}, userAnswer)); });
        tempAnswers[currentQuestionIndex] = { question: currentQuestion.type, answer: answer };
        setUserAnswers(tempAnswers);
    };
    /**
     * Show next question or send all answers for Idology verifications when we've answered enough
     */
    var submitAnswers = function () {
        var _a, _b;
        if (!userAnswers.at(currentQuestionIndex)) {
            return;
        }
        // Get the number of questions that were skipped by the user.
        var skippedQuestionsCount = userAnswers.filter(function (answer) { return answer.answer === SKIP_QUESTION_TEXT; }).length;
        // We have enough answers, let's call expectID KBA to verify them
        if (userAnswers.length - skippedQuestionsCount >= questions.length - MAX_SKIP) {
            var tempAnswers = userAnswers.map(function (answer) { return (__assign({}, answer)); });
            // Auto skip any remaining questions
            if (tempAnswers.length < questions.length) {
                for (var i = tempAnswers.length; i < questions.length; i++) {
                    tempAnswers[i] = { question: (_b = (_a = questions.at(i)) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : '', answer: SKIP_QUESTION_TEXT };
                }
            }
            BankAccounts.answerQuestionsForWallet(tempAnswers, idNumber);
            setUserAnswers(tempAnswers);
        }
        else {
            // Else, show next question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShouldHideSkipAnswer(skippedQuestionsCount >= MAX_SKIP);
        }
    };
    var validate = function (values) {
        var errors = {};
        if (!values.answer) {
            errors.answer = translate('additionalDetailsStep.selectAnswer');
        }
        return errors;
    };
    return (<react_native_1.View style={styles.flex1}>
            <react_native_1.View style={styles.ph5}>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('additionalDetailsStep.helpTextIdologyQuestions')}</Text_1.default>
            </react_native_1.View>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS} onSubmit={submitAnswers} key={currentQuestionIndex} validate={validate} scrollContextEnabled style={[styles.flexGrow1, styles.ph5]} submitButtonText={translate('common.saveAndContinue')} shouldHideFixErrorsAlert>
                <>
                    <InputWrapper_1.default InputComponent={SingleChoiceQuestion_1.default} inputID="answer" prompt={(_c = currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.prompt) !== null && _c !== void 0 ? _c : ''} possibleAnswers={possibleAnswers} currentQuestionIndex={currentQuestionIndex} onValueChange={function (value) {
            chooseAnswer(String(value));
        }} onInputChange={function () { }}/>
                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
                        <Icon_1.default src={Expensicons.QuestionMark} width={12} height={12} fill={theme.icon}/>
                        <TextLink_1.default style={[styles.textMicro, styles.ml2]} href={CONST_1.default.HELP_LINK_URL}>
                            {translate('additionalDetailsStep.helpLink')}
                        </TextLink_1.default>
                    </react_native_1.View>
                </>
            </FormProvider_1.default>
        </react_native_1.View>);
}
IdologyQuestions.displayName = 'IdologyQuestions';
exports.default = IdologyQuestions;
