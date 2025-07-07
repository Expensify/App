"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useSubStep;
var react_1 = require("react");
function calculateLastIndex(bodyContentLength, skipSteps) {
    if (skipSteps === void 0) { skipSteps = []; }
    var lastIndex = bodyContentLength - 1;
    while (skipSteps.includes(lastIndex)) {
        lastIndex -= 1;
    }
    return lastIndex;
}
/**
 * This hook ensures uniform handling of components across different screens, enabling seamless integration and navigation through sub steps of the VBBA flow.
 * @param bodyContent - array of components to display in particular step
 * @param onFinished - callback triggered after finish last step
 * @param startFrom - initial index for bodyContent array
 * @param onNextSubStep - callback triggered after finish each step
 * @param skipSteps - array of indexes to skip
 */
function useSubStep(_a) {
    var bodyContent = _a.bodyContent, onFinished = _a.onFinished, _b = _a.startFrom, startFrom = _b === void 0 ? 0 : _b, _c = _a.skipSteps, skipSteps = _c === void 0 ? [] : _c, _d = _a.onNextSubStep, onNextSubStep = _d === void 0 ? function () { } : _d;
    var _e = (0, react_1.useState)(startFrom), screenIndex = _e[0], setScreenIndex = _e[1];
    var isEditing = (0, react_1.useRef)(false);
    if (bodyContent.length === skipSteps.length) {
        throw new Error('All steps are skipped');
    }
    var lastScreenIndex = (0, react_1.useMemo)(function () { return calculateLastIndex(bodyContent.length, skipSteps); }, [bodyContent.length, skipSteps]);
    var prevScreen = (0, react_1.useCallback)(function () {
        var decrementNumber = 1;
        while (screenIndex - decrementNumber >= 0 && skipSteps.includes(screenIndex - decrementNumber)) {
            decrementNumber += 1;
        }
        var prevScreenIndex = screenIndex - decrementNumber;
        if (prevScreenIndex < 0) {
            return;
        }
        setScreenIndex(prevScreenIndex);
    }, [screenIndex, skipSteps]);
    var nextScreen = (0, react_1.useCallback)(function (finishData) {
        if (isEditing.current) {
            isEditing.current = false;
            setScreenIndex(lastScreenIndex);
            return;
        }
        var incrementNumber = 1;
        while (screenIndex + incrementNumber < lastScreenIndex && skipSteps.includes(screenIndex + incrementNumber)) {
            incrementNumber += 1;
        }
        var nextScreenIndex = screenIndex + incrementNumber;
        if (nextScreenIndex === lastScreenIndex + 1) {
            onFinished(finishData);
        }
        else {
            onNextSubStep();
            setScreenIndex(nextScreenIndex);
        }
    }, [screenIndex, lastScreenIndex, skipSteps, onFinished, onNextSubStep]);
    var moveTo = (0, react_1.useCallback)(function (step, turnOnEditMode) {
        isEditing.current = !(turnOnEditMode !== undefined && !turnOnEditMode);
        setScreenIndex(step);
    }, []);
    var resetScreenIndex = (0, react_1.useCallback)(function (newScreenIndex) {
        if (newScreenIndex === void 0) { newScreenIndex = 0; }
        isEditing.current = false;
        setScreenIndex(newScreenIndex);
    }, []);
    var goToTheLastStep = (0, react_1.useCallback)(function () {
        isEditing.current = false;
        setScreenIndex(lastScreenIndex);
    }, [lastScreenIndex]);
    // eslint-disable-next-line react-compiler/react-compiler
    return {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        componentToRender: bodyContent.at(screenIndex),
        // eslint-disable-next-line react-compiler/react-compiler
        isEditing: isEditing.current,
        screenIndex: screenIndex,
        prevScreen: prevScreen,
        nextScreen: nextScreen,
        lastScreenIndex: lastScreenIndex,
        moveTo: moveTo,
        resetScreenIndex: resetScreenIndex,
        goToTheLastStep: goToTheLastStep,
    };
}
