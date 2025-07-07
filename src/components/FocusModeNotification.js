"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var colors_1 = require("@styles/theme/colors");
var ConfirmModal_1 = require("./ConfirmModal");
var Illustrations_1 = require("./Icon/Illustrations");
var Text_1 = require("./Text");
var TextLink_1 = require("./TextLink");
function FocusModeNotification(_a) {
    var onClose = _a.onClose;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var translate = (0, useLocalize_1.default)().translate;
    var href = "".concat(environmentURL, "/settings/preferences/priority-mode");
    return (<ConfirmModal_1.default title={translate('focusModeUpdateModal.title')} confirmText={translate('common.buttonConfirm')} onConfirm={onClose} shouldShowCancelButton={false} onBackdropPress={onClose} onCancel={onClose} prompt={<Text_1.default>
                    {translate('focusModeUpdateModal.prompt')}
                    <TextLink_1.default style={styles.link} onPress={function () {
                onClose();
                (0, Link_1.openLink)(href, environmentURL);
            }}>
                        {translate('focusModeUpdateModal.settings')}
                    </TextLink_1.default>
                    .
                </Text_1.default>} isVisible image={Illustrations_1.ThreeLeggedLaptopWoman} imageStyles={StyleUtils.getBackgroundColorStyle(colors_1.default.pink800)} titleStyles={[styles.textHeadline, styles.mbn3]}/>);
}
FocusModeNotification.displayName = 'FocusModeNotification';
exports.default = FocusModeNotification;
