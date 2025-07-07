"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Consumer_1 = require("@components/DragAndDrop/Consumer");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ReportDropUI(_a) {
    var onDrop = _a.onDrop;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<Consumer_1.default onDrop={onDrop}>
            <react_native_1.View style={[styles.reportDropOverlay, styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <react_native_1.View style={styles.mb3}>
                    <Icon_1.default src={Expensicons.DragAndDrop} width={100} height={100}/>
                </react_native_1.View>
                <Text_1.default style={[styles.textHeadline]}>{translate('reportActionCompose.dropToUpload')}</Text_1.default>
            </react_native_1.View>
        </Consumer_1.default>);
}
ReportDropUI.displayName = 'ReportDropUI';
exports.default = ReportDropUI;
