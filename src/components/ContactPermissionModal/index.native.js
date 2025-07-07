"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_permissions_1 = require("react-native-permissions");
var ConfirmModal_1 = require("@components/ConfirmModal");
var Illustrations = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ContactPermission_1 = require("@libs/ContactPermission");
var hasShownContactImportPromptThisSession = false;
function ContactPermissionModal(_a) {
    var onDeny = _a.onDeny, onGrant = _a.onGrant, onFocusTextInput = _a.onFocusTextInput;
    var _b = (0, react_1.useState)(false), isModalVisible = _b[0], setIsModalVisible = _b[1];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    (0, react_1.useEffect)(function () {
        if (hasShownContactImportPromptThisSession) {
            onFocusTextInput();
            return;
        }
        (0, ContactPermission_1.getContactPermission)().then(function (status) {
            // Permission hasn't been asked yet, show the soft permission modal
            if (status !== react_native_permissions_1.RESULTS.DENIED) {
                onFocusTextInput();
                return;
            }
            hasShownContactImportPromptThisSession = true;
            setIsModalVisible(true);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var handleGrantPermission = function () {
        setIsModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            (0, ContactPermission_1.requestContactPermission)().then(function (status) {
                onFocusTextInput();
                if (status !== react_native_permissions_1.RESULTS.GRANTED) {
                    return;
                }
                onGrant();
            });
        });
    };
    var handleCloseModal = function () {
        setIsModalVisible(false);
        onDeny(react_native_permissions_1.RESULTS.DENIED);
        // Sometimes, the input gains focus when the modal closes, but the keyboard doesn't appear.
        // To fix this, we need to call the focus function after the modal has finished closing.
        react_native_1.InteractionManager.runAfterInteractions(function () {
            onFocusTextInput();
        });
    };
    if (!isModalVisible) {
        return null;
    }
    return (<ConfirmModal_1.default isVisible={isModalVisible} onConfirm={handleGrantPermission} onCancel={handleCloseModal} onBackdropPress={handleCloseModal} confirmText={translate('common.continue')} cancelText={translate('common.notNow')} prompt={translate('contact.importContactsText')} promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]} title={translate('contact.importContactsTitle')} titleContainerStyles={[styles.mt2, styles.mb0]} titleStyles={[styles.textHeadline]} iconSource={Illustrations.ToddWithPhones} iconFill={false} iconWidth={176} iconHeight={178} shouldCenterIcon shouldReverseStackedButtons/>);
}
ContactPermissionModal.displayName = 'ContactPermissionModal';
exports.default = ContactPermissionModal;
