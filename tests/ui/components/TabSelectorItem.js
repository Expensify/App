"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var TabSelectorItem_1 = require("@components/TabSelector/TabSelectorItem");
var Tooltip_1 = require("@components/Tooltip");
// Mock the Tooltip component since it uses portals which aren't supported in RNTL
jest.mock('@components/Tooltip');
jest.mock('@libs/Fullstory', function () { return ({
    default: {
        consentAndIdentify: jest.fn(),
    },
    parseFSAttributes: jest.fn(),
}); });
describe('TabSelectorItem Component', function () {
    var title = 'Test Tab';
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('should show tooltip for inactive tab with hidden label', function () {
        // Given an inactive tab with a hidden label
        (0, react_native_1.render)(<TabSelectorItem_1.default title={title} shouldShowLabelWhenInactive={false} isActive={false}/>);
        // Then the tooltip should be rendered with correct content because the label is hidden
        expect(Tooltip_1.default).toHaveBeenCalledWith(expect.objectContaining({
            shouldRender: true,
            text: title,
        }), undefined);
    });
    it('should not show tooltip for active tab', function () {
        // Given an active tab
        (0, react_native_1.render)(<TabSelectorItem_1.default title={title} shouldShowLabelWhenInactive={false} isActive/>);
        // When hovering over the tab button
        // Then the tooltip should not render because the tab is active
        expect(Tooltip_1.default).toHaveBeenCalledWith(expect.objectContaining({
            shouldRender: false,
            text: title,
        }), undefined);
    });
    it('should not show tooltip when label is visible', function () {
        // Given an inactive tab with visible label
        (0, react_native_1.render)(<TabSelectorItem_1.default title={title} shouldShowLabelWhenInactive isActive={false}/>);
        // When hovering over the tab button
        // Then the tooltip should not render because the label is already visible
        expect(Tooltip_1.default).toHaveBeenCalledWith(expect.objectContaining({
            shouldRender: false,
            text: title,
        }), undefined);
    });
});
