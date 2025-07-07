"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var convertToLTR_1 = require("@libs/convertToLTR");
var variables_1 = require("@styles/variables");
var Icon_1 = require("./Icon");
var Illustrations = require("./Icon/Illustrations");
var RenderHTML_1 = require("./RenderHTML");
var changeWorkspaceMenuSections = [
    {
        icon: Illustrations.FolderOpen,
        titleTranslationKey: 'iou.changePolicyEducational.reCategorize',
    },
    {
        icon: Illustrations.Workflows,
        titleTranslationKey: 'iou.changePolicyEducational.workflows',
    },
];
function ChangeWorkspaceMenuSectionList() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<>
            {changeWorkspaceMenuSections.map(function (section) { return (<react_native_1.View key={section.titleTranslationKey} style={[styles.flexRow, styles.alignItemsCenter, styles.mt3]}>
                    <Icon_1.default width={variables_1.default.menuIconSize} height={variables_1.default.menuIconSize} src={section.icon} additionalStyles={[styles.mr4]}/>
                    <react_native_1.View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter, styles.alignItemsCenter, styles.wAuto]}>
                        <RenderHTML_1.default html={"<comment>".concat((0, convertToLTR_1.default)(translate(section.titleTranslationKey)), "</comment>")}/>
                    </react_native_1.View>
                </react_native_1.View>); })}
        </>);
}
ChangeWorkspaceMenuSectionList.displayName = 'ChangeWorkspaceMenuSectionList';
exports.default = ChangeWorkspaceMenuSectionList;
