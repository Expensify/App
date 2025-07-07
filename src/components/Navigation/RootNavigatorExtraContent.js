"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SidePanel_1 = require("@components/SidePanel");
var TopLevelNavigationTabBar_1 = require("./TopLevelNavigationTabBar");
function RootNavigatorExtraContent(_a) {
    var state = _a.state;
    return (<>
            <TopLevelNavigationTabBar_1.default state={state}/>
            <SidePanel_1.default />
        </>);
}
RootNavigatorExtraContent.displayName = 'RootNavigatorExtraContent';
exports.default = RootNavigatorExtraContent;
