"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var Text_1 = require("@components/Text");
var useSubStep_1 = require("@hooks/useSubStep");
function MockSubStepComponent(_a) {
    var screenIndex = _a.screenIndex;
    return <Text_1.default>{screenIndex}</Text_1.default>;
}
function MockSubStepComponent2(_a) {
    var screenIndex = _a.screenIndex;
    return <Text_1.default>{screenIndex}</Text_1.default>;
}
function MockSubStepComponent3(_a) {
    var screenIndex = _a.screenIndex;
    return <Text_1.default>{screenIndex}</Text_1.default>;
}
function MockSubStepComponent4(_a) {
    var screenIndex = _a.screenIndex;
    return <Text_1.default>{screenIndex}</Text_1.default>;
}
var mockOnFinished = jest.fn();
var mockOnFinished2 = jest.fn();
describe('useSubStep hook', function () {
    describe('given skipSteps as empty array', function () {
        it('returns componentToRender, isEditing, currentIndex, prevScreen, nextScreen, moveTo', function () {
            var result = (0, react_native_1.renderHook)(function () { return (0, useSubStep_1.default)({ bodyContent: [MockSubStepComponent], onFinished: mockOnFinished, startFrom: 0 }); }).result;
            var _a = result.current, componentToRender = _a.componentToRender, isEditing = _a.isEditing, moveTo = _a.moveTo, nextScreen = _a.nextScreen, prevScreen = _a.prevScreen, screenIndex = _a.screenIndex;
            expect(componentToRender).toBe(MockSubStepComponent);
            expect(isEditing).toBe(false);
            expect(screenIndex).toBe(0);
            expect(typeof prevScreen).toBe('function');
            expect(typeof nextScreen).toBe('function');
            expect(typeof moveTo).toBe('function');
        });
        it('calls onFinished when it is the last step', function () {
            var result = (0, react_native_1.renderHook)(function () { return (0, useSubStep_1.default)({ bodyContent: [MockSubStepComponent], onFinished: mockOnFinished, startFrom: 0 }); }).result;
            var nextScreen = result.current.nextScreen;
            (0, react_native_1.act)(function () {
                nextScreen();
            });
            expect(mockOnFinished).toHaveBeenCalledTimes(1);
        });
        it('returns component at requested substep when calling moveTo', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({ bodyContent: [MockSubStepComponent2, MockSubStepComponent, MockSubStepComponent], onFinished: mockOnFinished, startFrom: 2 });
            }), result = _a.result, rerender = _a.rerender;
            var moveTo = result.current.moveTo;
            (0, react_native_1.act)(function () {
                moveTo(0);
            });
            rerender({});
            var componentToRender = result.current.componentToRender;
            expect(componentToRender).toBe(MockSubStepComponent2);
        });
        it('returns substep component at the previous index when calling prevScreen (if possible)', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({ bodyContent: [MockSubStepComponent2, MockSubStepComponent, MockSubStepComponent], onFinished: mockOnFinished, startFrom: 1 });
            }), result = _a.result, rerender = _a.rerender;
            var _b = result.current, prevScreen = _b.prevScreen, screenIndex = _b.screenIndex;
            expect(screenIndex).toBe(1);
            (0, react_native_1.act)(function () {
                prevScreen();
            });
            rerender({});
            var _c = result.current, componentToRender = _c.componentToRender, newScreenIndex = _c.screenIndex;
            expect(newScreenIndex).toBe(0);
            expect(componentToRender).toBe(MockSubStepComponent2);
        });
        it('stays on the first substep component when calling prevScreen on the first screen', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({ bodyContent: [MockSubStepComponent2, MockSubStepComponent, MockSubStepComponent], onFinished: mockOnFinished, startFrom: 0 });
            }), result = _a.result, rerender = _a.rerender;
            var _b = result.current, componentToRender = _b.componentToRender, prevScreen = _b.prevScreen, screenIndex = _b.screenIndex;
            expect(screenIndex).toBe(0);
            expect(componentToRender).toBe(MockSubStepComponent2);
            (0, react_native_1.act)(function () {
                prevScreen();
            });
            rerender({});
            var _c = result.current, newComponentToRender = _c.componentToRender, newScreenIndex = _c.screenIndex;
            expect(newScreenIndex).toBe(0);
            expect(newComponentToRender).toBe(MockSubStepComponent2);
        });
    });
    describe('given skipSteps as non-empty array', function () {
        it('calls onFinished when it is the second last step (last step is skipped)', function () {
            var result = (0, react_native_1.renderHook)(function () { return (0, useSubStep_1.default)({ bodyContent: [MockSubStepComponent, MockSubStepComponent2], onFinished: mockOnFinished2, startFrom: 0, skipSteps: [1] }); }).result;
            var nextScreen = result.current.nextScreen;
            (0, react_native_1.act)(function () {
                nextScreen();
            });
            expect(mockOnFinished2).toHaveBeenCalledTimes(1);
        });
        it('returns component at requested substep when calling moveTo even though the step is marked as skipped', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({ bodyContent: [MockSubStepComponent2, MockSubStepComponent3, MockSubStepComponent], onFinished: mockOnFinished, startFrom: 2, skipSteps: [1] });
            }), result = _a.result, rerender = _a.rerender;
            var moveTo = result.current.moveTo;
            (0, react_native_1.act)(function () {
                moveTo(1);
            });
            rerender({});
            var componentToRender = result.current.componentToRender;
            expect(componentToRender).toBe(MockSubStepComponent3);
        });
        it('returns substep component at the previous index when calling prevScreen (if possible)', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({
                    bodyContent: [MockSubStepComponent, MockSubStepComponent2, MockSubStepComponent3, MockSubStepComponent4],
                    onFinished: mockOnFinished,
                    startFrom: 3,
                    skipSteps: [0, 2],
                });
            }), result = _a.result, rerender = _a.rerender;
            var _b = result.current, prevScreen = _b.prevScreen, screenIndex = _b.screenIndex;
            expect(screenIndex).toBe(3);
            (0, react_native_1.act)(function () {
                prevScreen();
            });
            rerender({});
            var _c = result.current, componentToRender = _c.componentToRender, newScreenIndex = _c.screenIndex;
            expect(newScreenIndex).toBe(1);
            expect(componentToRender).toBe(MockSubStepComponent2);
        });
        it('stays on the first substep component when calling prevScreen on the second screen if the first screen is skipped', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({ bodyContent: [MockSubStepComponent, MockSubStepComponent2, MockSubStepComponent3], onFinished: mockOnFinished, startFrom: 1, skipSteps: [0] });
            }), result = _a.result, rerender = _a.rerender;
            var _b = result.current, componentToRender = _b.componentToRender, prevScreen = _b.prevScreen, screenIndex = _b.screenIndex;
            expect(screenIndex).toBe(1);
            expect(componentToRender).toBe(MockSubStepComponent2);
            (0, react_native_1.act)(function () {
                prevScreen();
            });
            rerender({});
            var _c = result.current, newComponentToRender = _c.componentToRender, newScreenIndex = _c.screenIndex;
            expect(newScreenIndex).toBe(1);
            expect(newComponentToRender).toBe(MockSubStepComponent2);
        });
        it('skips step which are marked as skipped when using nextScreen', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({
                    bodyContent: [MockSubStepComponent, MockSubStepComponent2, MockSubStepComponent3, MockSubStepComponent4],
                    onFinished: mockOnFinished,
                    startFrom: 0,
                    skipSteps: [1, 2],
                });
            }), result = _a.result, rerender = _a.rerender;
            var _b = result.current, componentToRender = _b.componentToRender, nextScreen = _b.nextScreen, screenIndex = _b.screenIndex;
            expect(screenIndex).toBe(0);
            expect(componentToRender).toBe(MockSubStepComponent);
            (0, react_native_1.act)(function () {
                nextScreen();
            });
            rerender({});
            var _c = result.current, newComponentToRender = _c.componentToRender, newScreenIndex = _c.screenIndex;
            expect(newScreenIndex).toBe(3);
            expect(newComponentToRender).toBe(MockSubStepComponent4);
        });
        it('nextScreen works correctly when called from skipped screen', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({
                    bodyContent: [MockSubStepComponent, MockSubStepComponent2, MockSubStepComponent3, MockSubStepComponent4],
                    onFinished: mockOnFinished,
                    startFrom: 1,
                    skipSteps: [1, 2],
                });
            }), result = _a.result, rerender = _a.rerender;
            var _b = result.current, componentToRender = _b.componentToRender, nextScreen = _b.nextScreen, screenIndex = _b.screenIndex;
            expect(screenIndex).toBe(1);
            expect(componentToRender).toBe(MockSubStepComponent2);
            (0, react_native_1.act)(function () {
                nextScreen();
            });
            rerender({});
            var _c = result.current, newComponentToRender = _c.componentToRender, newScreenIndex = _c.screenIndex;
            expect(newScreenIndex).toBe(3);
            expect(newComponentToRender).toBe(MockSubStepComponent4);
        });
        it('skips step which are marked as skipped when using prevScreen', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({
                    bodyContent: [MockSubStepComponent, MockSubStepComponent2, MockSubStepComponent3, MockSubStepComponent4],
                    onFinished: mockOnFinished,
                    startFrom: 3,
                    skipSteps: [1, 2],
                });
            }), result = _a.result, rerender = _a.rerender;
            var _b = result.current, componentToRender = _b.componentToRender, prevScreen = _b.prevScreen, screenIndex = _b.screenIndex;
            expect(screenIndex).toBe(3);
            expect(componentToRender).toBe(MockSubStepComponent4);
            (0, react_native_1.act)(function () {
                prevScreen();
            });
            rerender({});
            var _c = result.current, newComponentToRender = _c.componentToRender, newScreenIndex = _c.screenIndex;
            expect(newScreenIndex).toBe(0);
            expect(newComponentToRender).toBe(MockSubStepComponent);
        });
        it('prevScreen works correctly when called from skipped screen', function () {
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useSubStep_1.default)({
                    bodyContent: [MockSubStepComponent, MockSubStepComponent2, MockSubStepComponent3, MockSubStepComponent4],
                    onFinished: mockOnFinished,
                    startFrom: 2,
                    skipSteps: [1, 2],
                });
            }), result = _a.result, rerender = _a.rerender;
            var _b = result.current, componentToRender = _b.componentToRender, prevScreen = _b.prevScreen, screenIndex = _b.screenIndex;
            expect(screenIndex).toBe(2);
            expect(componentToRender).toBe(MockSubStepComponent3);
            (0, react_native_1.act)(function () {
                prevScreen();
            });
            rerender({});
            var _c = result.current, newComponentToRender = _c.componentToRender, newScreenIndex = _c.screenIndex;
            expect(newScreenIndex).toBe(0);
            expect(newComponentToRender).toBe(MockSubStepComponent);
        });
    });
});
