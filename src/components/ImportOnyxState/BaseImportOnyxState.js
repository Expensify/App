"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AttachmentPicker_1 = require("@components/AttachmentPicker");
var DecisionModal_1 = require("@components/DecisionModal");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function BaseImportOnyxState(_a) {
    var onFileRead = _a.onFileRead, isErrorModalVisible = _a.isErrorModalVisible, setIsErrorModalVisible = _a.setIsErrorModalVisible;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    return (<>
            <AttachmentPicker_1.default acceptedFileTypes={['text']} shouldHideCameraOption shouldHideGalleryOption>
                {function (_a) {
            var openPicker = _a.openPicker;
            return (<MenuItem_1.default icon={Expensicons.Upload} title={translate('initialSettingsPage.troubleshoot.importOnyxState')} wrapperStyle={[styles.sectionMenuItemTopDescription]} onPress={function () {
                    openPicker({
                        onPicked: function (data) { var _a; return onFileRead((_a = data.at(0)) !== null && _a !== void 0 ? _a : {}); },
                    });
                }}/>);
        }}
            </AttachmentPicker_1.default>
            <DecisionModal_1.default title={translate('initialSettingsPage.troubleshoot.invalidFile')} prompt={translate('initialSettingsPage.troubleshoot.invalidFileDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsErrorModalVisible(false); }} secondOptionText={translate('common.ok')} isVisible={isErrorModalVisible} onClose={function () { return setIsErrorModalVisible(false); }}/>
        </>);
}
exports.default = BaseImportOnyxState;
