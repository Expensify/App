"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var AttachmentContext_1 = require("@components/AttachmentContext");
var VideoRenderer_1 = require("@components/HTMLEngineProvider/HTMLRenderers/VideoRenderer");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
jest.mock('@libs/Navigation/Navigation', function () { return ({
    navigate: jest.fn(),
}); });
// Mock VideoPlayerPreview to simplify testing
jest.mock('@components/VideoPlayerPreview', function () {
    return function (_a) {
        var onShowModalPress = _a.onShowModalPress, fileName = _a.fileName;
        // Get PressableWithoutFeedback inside the component to avoid Jest mock issues
        var PressableWithoutFeedback = require('@components/Pressable').PressableWithoutFeedback;
        var handlePress = function () {
            onShowModalPress === null || onShowModalPress === void 0 ? void 0 : onShowModalPress();
        };
        return (<PressableWithoutFeedback testID="show-modal-button" onPress={handlePress} accessibilityRole="button" accessibilityLabel={fileName}/>);
    };
});
var mockShowContextMenuValue = {
    anchor: null,
    report: undefined,
    isReportArchived: false,
    action: undefined,
    transactionThreadReport: undefined,
    checkIfContextMenuActive: function () { },
    isDisabled: true,
    onShowContextMenu: function (callback) { return callback(); },
};
var mockTNodeAttributes = (_a = {},
    _a[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE] = 'video/test.mp4',
    _a[CONST_1.default.ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE] = 'thumbnail/test.jpg',
    _a[CONST_1.default.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE] = '640',
    _a[CONST_1.default.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE] = '480',
    _a[CONST_1.default.ATTACHMENT_DURATION_ATTRIBUTE] = '60',
    _a);
describe('VideoRenderer', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('should open the report attachment with isAuthTokenRequired=true', function () {
        // Given a VideoRenderer component with a valid attributes
        (0, react_native_1.render)(<ShowContextMenuContext_1.ShowContextMenuContext.Provider value={mockShowContextMenuValue}>
                <AttachmentContext_1.AttachmentContext.Provider value={{ type: CONST_1.default.ATTACHMENT_TYPE.SEARCH }}>
                    {/* @ts-expect-error - Ignoring type errors for testing purposes */}
                    <VideoRenderer_1.default tnode={{ attributes: mockTNodeAttributes }}/>
                </AttachmentContext_1.AttachmentContext.Provider>
            </ShowContextMenuContext_1.ShowContextMenuContext.Provider>);
        // When the user presses the show modal button
        react_native_1.fireEvent.press(react_native_1.screen.getByTestId('show-modal-button'));
        expect(Navigation_1.default.navigate).toHaveBeenCalled();
        // Then it should navigate to the attachments route with isAuthTokenRequired=true
        var mockNavigate = jest.spyOn(Navigation_1.default, 'navigate');
        var firstCall = mockNavigate.mock.calls.at(0);
        var navigateArgs = firstCall === null || firstCall === void 0 ? void 0 : firstCall.at(0);
        expect(navigateArgs).toContain('isAuthTokenRequired=true');
    });
});
