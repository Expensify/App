"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var Clipboard_1 = require("@libs/Clipboard");
var Expensicons = require("./Icon/Expensicons");
var PressableWithDelayToggle_1 = require("./Pressable/PressableWithDelayToggle");
function CopyTextToClipboard(_a) {
    var text = _a.text, textStyles = _a.textStyles, urlToCopy = _a.urlToCopy, accessibilityRole = _a.accessibilityRole;
    var translate = (0, useLocalize_1.default)().translate;
    var copyToClipboard = (0, react_1.useCallback)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
        Clipboard_1.default.setString(urlToCopy || text);
    }, [text, urlToCopy]);
    return (<PressableWithDelayToggle_1.default text={text} tooltipText={translate('reportActionContextMenu.copyToClipboard')} tooltipTextChecked={translate('reportActionContextMenu.copied')} icon={Expensicons.Copy} textStyles={textStyles} onPress={copyToClipboard} accessible accessibilityLabel={translate('reportActionContextMenu.copyToClipboard')} accessibilityRole={accessibilityRole}/>);
}
CopyTextToClipboard.displayName = 'CopyTextToClipboard';
exports.default = CopyTextToClipboard;
