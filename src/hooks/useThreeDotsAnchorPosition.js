"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var variables_1 = require("@styles/variables");
var useSidePanel_1 = require("./useSidePanel");
var useWindowDimensions_1 = require("./useWindowDimensions");
/**
 * Hook that calculates the anchor position for the three dots menu
 * based on the current screen width and the visibility of a Side Panel.
 */
function useThreeDotsAnchorPosition(anchorPositionStyle) {
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var shouldHideSidePanel = (0, useSidePanel_1.useSidePanelDisplayStatus)().shouldHideSidePanel;
    return anchorPositionStyle(shouldHideSidePanel ? windowWidth : windowWidth - variables_1.default.sideBarWidth);
}
exports.default = useThreeDotsAnchorPosition;
