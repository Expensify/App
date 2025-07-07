"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is a helper function to create a mock for the addListener function of the react-navigation library.
 * The reason we need this is because we need to trigger the transitionEnd event in our tests to simulate
 * the transitionEnd event that is triggered when the screen transition animation is completed.
 *
 * @returns An object with two functions: triggerTransitionEnd and addListener
 */
var createAddListenerMock = function () {
    var transitionEndListeners = [];
    var triggerTransitionEnd = function () {
        transitionEndListeners.forEach(function (transitionEndListener) { return transitionEndListener(); });
    };
    var addListener = jest.fn().mockImplementation(function (listener, callback) {
        if (listener === 'transitionEnd') {
            transitionEndListeners.push(callback);
        }
        return function () {
            transitionEndListeners.filter(function (cb) { return cb !== callback; });
        };
    });
    return { triggerTransitionEnd: triggerTransitionEnd, addListener: addListener };
};
exports.default = createAddListenerMock;
