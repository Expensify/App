"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var test_drive_svg_1 = require("@assets/images/test-drive.svg");
var FeatureTrainingModal_1 = require("@components/FeatureTrainingModal");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function BaseTestDriveModal(_a) {
    var description = _a.description, onConfirm = _a.onConfirm, onHelp = _a.onHelp, children = _a.children, shouldCloseOnConfirm = _a.shouldCloseOnConfirm, shouldRenderHTMLDescription = _a.shouldRenderHTMLDescription, avoidKeyboard = _a.avoidKeyboard, shouldShowConfirmationLoader = _a.shouldShowConfirmationLoader, canConfirmWhileOffline = _a.canConfirmWhileOffline, shouldCallOnHelpWhenModalHidden = _a.shouldCallOnHelpWhenModalHidden;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<FeatureTrainingModal_1.default image={test_drive_svg_1.default} illustrationOuterContainerStyle={styles.p0} illustrationAspectRatio={CONST_1.default.FEATURE_TRAINING.TEST_DRIVE_COVER_ASPECT_RATIO} title={translate('testDrive.modal.title')} description={description} helpText={translate('testDrive.modal.helpText')} confirmText={translate('testDrive.modal.confirmText')} onHelp={onHelp} onConfirm={onConfirm} modalInnerContainerStyle={styles.testDriveModalContainer(shouldUseNarrowLayout)} contentInnerContainerStyles={styles.gap2} shouldCloseOnConfirm={shouldCloseOnConfirm} shouldRenderHTMLDescription={shouldRenderHTMLDescription} avoidKeyboard={avoidKeyboard} shouldShowConfirmationLoader={shouldShowConfirmationLoader} shouldUseScrollView canConfirmWhileOffline={canConfirmWhileOffline} shouldCallOnHelpWhenModalHidden={shouldCallOnHelpWhenModalHidden}>
            {children}
        </FeatureTrainingModal_1.default>);
}
BaseTestDriveModal.displayName = 'BaseTestDriveModal';
exports.default = BaseTestDriveModal;
