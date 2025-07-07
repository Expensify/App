"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var colors_1 = require("@styles/theme/colors");
var Button_1 = require("@src/components/Button");
var CONST_1 = require("@src/CONST");
var buttonText = 'Click me';
var accessibilityLabel = 'button-label';
describe('Button Component', function () {
    var renderButton = function (props) {
        if (props === void 0) { props = {}; }
        return (0, react_native_1.render)(<Button_1.default text={buttonText} 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}/>);
    };
    var onPress = jest.fn();
    var getButton = function () { return react_native_1.screen.getByRole(CONST_1.default.ROLE.BUTTON, { name: buttonText }); };
    afterEach(function () {
        jest.clearAllMocks();
    });
    it('renders correctly with default text', function () {
        // Given the component is rendered
        renderButton();
        // Then the default text is displayed
        expect(react_native_1.screen.getByText(buttonText)).toBeOnTheScreen();
    });
    it('renders without text gracefully', function () {
        // Given the component is rendered without text
        renderButton({ text: undefined });
        // Then the button is not displayed
        expect(react_native_1.screen.queryByText(buttonText)).not.toBeOnTheScreen();
    });
    it('handles press event correctly', function () {
        // Given the component is rendered with an onPress function
        renderButton({ onPress: onPress });
        // When the button is pressed
        react_native_1.fireEvent.press(getButton());
        // Then the onPress function should be called
        expect(onPress).toHaveBeenCalledTimes(1);
    });
    it('renders loading state', function () {
        // Given the component is rendered with isLoading
        renderButton({ isLoading: true });
        // Then the loading state is displayed
        expect(react_native_1.screen.getByText(buttonText)).not.toBeVisible();
    });
    it('disables button when isDisabled is true', function () {
        // Given the component is rendered with isDisabled set to true
        renderButton({ isDisabled: true, onPress: onPress });
        // When the button is pressed
        react_native_1.fireEvent.press(getButton());
        // Then the onPress function should not be called
        expect(onPress).not.toHaveBeenCalled();
    });
    it('sets accessibility label correctly', function () {
        // Given the component is rendered with an accessibility label
        renderButton({ accessibilityLabel: accessibilityLabel });
        // Then the button should be accessible using the provided label
        expect(react_native_1.screen.getByLabelText(accessibilityLabel)).toBeOnTheScreen();
    });
    it('applies custom styles correctly', function () {
        // Given the component is rendered with custom styles
        renderButton({ accessibilityLabel: accessibilityLabel, innerStyles: { width: '100%' } });
        // Then the button should have the custom styles
        var buttonContainer = react_native_1.screen.getByLabelText(accessibilityLabel);
        expect(buttonContainer).toHaveStyle({ backgroundColor: colors_1.default.productDark400 });
        expect(buttonContainer).toHaveStyle({ width: '100%' });
    });
});
