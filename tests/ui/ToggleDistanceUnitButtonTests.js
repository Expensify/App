"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var index_android_1 = require("@components/MapView/ToggleDistanceUnitButton/index.android");
var Text_1 = require("@components/Text");
var CONST_1 = require("@src/CONST");
var onPressMock = jest.fn();
describe('ToggleDistanceUnitButton', function () {
    var renderButton = function (props) {
        return (0, react_native_1.render)(<index_android_1.default testID="pressable" accessibilityLabel="fake-button" accessibilityRole={CONST_1.default.ROLE.BUTTON} 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}>
                <Text_1.default>Click me</Text_1.default>
            </index_android_1.default>);
    };
    beforeEach(function () {
        jest.clearAllMocks();
    });
    test('should trigger onPress when tapped quickly', function () {
        // Given the component is rendered
        renderButton({ onPress: onPressMock, accessibilityLabel: 'ToggleDistanceUnitButton' });
        var pressable = react_native_1.screen.getByTestId('pressable');
        // When touch starts on the button
        (0, react_native_1.fireEvent)(pressable, 'touchStart', {
            nativeEvent: {
                pageX: 100,
                pageY: 100,
            },
        });
        // When touch end on the button
        (0, react_native_1.fireEvent)(pressable, 'touchEnd');
        // Then onPress should be called once
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });
    test('should not trigger onPress when dragged', function () {
        // Given the component is rendered
        renderButton({ onPress: onPressMock, accessibilityLabel: 'ToggleDistanceUnitButton' });
        var pressable = react_native_1.screen.getByTestId('pressable');
        // When touch start on the button
        (0, react_native_1.fireEvent)(pressable, 'touchStart', {
            nativeEvent: {
                pageX: 100,
                pageY: 100,
            },
        });
        // When the touch moves beyond the threshold (dragging)
        (0, react_native_1.fireEvent)(pressable, 'touchMove', {
            nativeEvent: {
                pageX: 110,
                pageY: 110,
            },
        });
        // When touch end on the button
        (0, react_native_1.fireEvent)(pressable, 'touchEnd');
        // Then onPress should not be called
        expect(onPressMock).not.toHaveBeenCalled();
    });
});
