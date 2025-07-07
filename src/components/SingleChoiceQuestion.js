"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var RadioButtons_1 = require("./RadioButtons");
var Text_1 = require("./Text");
function SingleChoiceQuestion(_a, ref) {
    var prompt = _a.prompt, errorText = _a.errorText, possibleAnswers = _a.possibleAnswers, currentQuestionIndex = _a.currentQuestionIndex, onInputChange = _a.onInputChange;
    var styles = (0, useThemeStyles_1.default)();
    return (<>
            <Text_1.default ref={ref} style={[styles.mt3]}>
                {prompt}
            </Text_1.default>
            <RadioButtons_1.default items={possibleAnswers} key={currentQuestionIndex} onPress={onInputChange} errorText={errorText}/>
        </>);
}
SingleChoiceQuestion.displayName = 'SingleChoiceQuestion';
exports.default = (0, react_1.forwardRef)(SingleChoiceQuestion);
