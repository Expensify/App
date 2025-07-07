"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useSidePanel_1 = require("@hooks/useSidePanel");
var HelpModal_1 = require("./HelpModal");
function SidePanel() {
    var _a = (0, useSidePanel_1.default)(), isSidePanelTransitionEnded = _a.isSidePanelTransitionEnded, shouldHideSidePanel = _a.shouldHideSidePanel, sidePanelTranslateX = _a.sidePanelTranslateX, shouldHideSidePanelBackdrop = _a.shouldHideSidePanelBackdrop, closeSidePanel = _a.closeSidePanel;
    if (isSidePanelTransitionEnded && shouldHideSidePanel) {
        return null;
    }
    return (<HelpModal_1.default shouldHideSidePanel={shouldHideSidePanel} sidePanelTranslateX={sidePanelTranslateX} closeSidePanel={closeSidePanel} shouldHideSidePanelBackdrop={shouldHideSidePanelBackdrop}/>);
}
SidePanel.displayName = 'SidePanel';
exports.default = SidePanel;
