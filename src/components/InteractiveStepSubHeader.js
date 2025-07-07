"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var colors_1 = require("@styles/theme/colors");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
var Text_1 = require("./Text");
var MIN_AMOUNT_FOR_EXPANDING = 3;
var MIN_AMOUNT_OF_STEPS = 2;
function InteractiveStepSubHeader(_a, ref) {
    var stepNames = _a.stepNames, _b = _a.startStepIndex, startStepIndex = _b === void 0 ? 0 : _b, onStepSelected = _a.onStepSelected;
    var styles = (0, useThemeStyles_1.default)();
    var containerWidthStyle = stepNames.length < MIN_AMOUNT_FOR_EXPANDING ? styles.mnw60 : styles.mnw100;
    if (stepNames.length < MIN_AMOUNT_OF_STEPS) {
        throw new Error("stepNames list must have at least ".concat(MIN_AMOUNT_OF_STEPS, " elements."));
    }
    var _c = (0, react_1.useState)(startStepIndex), currentStep = _c[0], setCurrentStep = _c[1];
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        moveNext: function () {
            setCurrentStep(function (actualStep) { return actualStep + 1; });
        },
        movePrevious: function () {
            setCurrentStep(function (actualStep) { return actualStep - 1; });
        },
        moveTo: function (step) {
            setCurrentStep(step);
        },
    }); }, []);
    var amountOfUnions = stepNames.length - 1;
    return (<react_native_1.View style={[styles.interactiveStepHeaderContainer, containerWidthStyle]}>
            {stepNames.map(function (stepName, index) {
            var isCompletedStep = currentStep > index;
            var isLockedStep = currentStep < index;
            var isLockedLine = currentStep < index + 1;
            var hasUnion = index < amountOfUnions;
            var moveToStep = function () {
                if (isLockedStep || !onStepSelected) {
                    return;
                }
                setCurrentStep(index);
                var step = stepNames.at(index);
                if (step) {
                    onStepSelected(step);
                }
            };
            return (<react_native_1.View style={[styles.interactiveStepHeaderStepContainer, hasUnion && styles.flex1]} key={stepName}>
                        <PressableWithFeedback_1.default style={[
                    styles.interactiveStepHeaderStepButton,
                    isLockedStep && styles.interactiveStepHeaderLockedStepButton,
                    isCompletedStep && styles.interactiveStepHeaderCompletedStepButton,
                    !onStepSelected && styles.cursorDefault,
                ]} disabled={isLockedStep || !onStepSelected} onPress={moveToStep} accessible accessibilityLabel={stepName[index]} role={CONST_1.default.ROLE.BUTTON}>
                            {isCompletedStep ? (<Icon_1.default src={Expensicons.Checkmark} width={variables_1.default.iconSizeNormal} height={variables_1.default.iconSizeNormal} fill={colors_1.default.white}/>) : (<Text_1.default style={[styles.interactiveStepHeaderStepText, isLockedStep && styles.textSupporting]}>{index + 1}</Text_1.default>)}
                        </PressableWithFeedback_1.default>
                        {hasUnion ? <react_native_1.View style={[styles.interactiveStepHeaderStepLine, isLockedLine && styles.interactiveStepHeaderLockedStepLine]}/> : null}
                    </react_native_1.View>);
        })}
        </react_native_1.View>);
}
InteractiveStepSubHeader.displayName = 'InteractiveStepSubHeader';
exports.default = (0, react_1.forwardRef)(InteractiveStepSubHeader);
