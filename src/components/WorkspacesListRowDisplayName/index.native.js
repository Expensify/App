"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils = require("@libs/EmojiUtils");
function WorkspacesListRowDisplayName(_a) {
    var isDeleted = _a.isDeleted, ownerName = _a.ownerName;
    var styles = (0, useThemeStyles_1.default)();
    var processedOwnerName = EmojiUtils.splitTextWithEmojis(ownerName);
    return (<Text_1.default numberOfLines={1} style={[styles.labelStrong, isDeleted ? styles.offlineFeedback.deleted : {}]}>
            {processedOwnerName.length !== 0
            ? EmojiUtils.getProcessedText(processedOwnerName, [styles.labelStrong, isDeleted ? styles.offlineFeedback.deleted : {}, styles.emojisWithTextFontFamily])
            : ownerName}
        </Text_1.default>);
}
WorkspacesListRowDisplayName.displayName = 'WorkspacesListRowDisplayName';
exports.default = WorkspacesListRowDisplayName;
