"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var variables_1 = require("@styles/variables");
var getDefaultWrapperStyle = function (theme) { return ({
    backgroundColor: theme.componentBG,
}); };
var getMiniWrapperStyle = function (theme, styles) { return [
    styles.flexRow,
    getDefaultWrapperStyle(theme),
    {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        height: 36,
        borderRadius: variables_1.default.buttonBorderRadius,
        borderWidth: 1,
        borderColor: theme.border,
    },
]; };
/**
 * Generate the wrapper styles for the ReportActionContextMenu.
 *
 * @param isMini
 * @param isSmallScreenWidth
 * @param theme
 */
var createReportActionContextMenuStyleUtils = function (_a) {
    var theme = _a.theme, styles = _a.styles;
    return ({
        getReportActionContextMenuStyles: function (isMini, isSmallScreenWidth) {
            if (isMini) {
                return getMiniWrapperStyle(theme, styles);
            }
            return [
                styles.flexColumn,
                getDefaultWrapperStyle(theme),
                // Small screens use a bottom-docked modal that already has vertical padding.
                isSmallScreenWidth ? {} : styles.pv4,
            ];
        },
    });
};
exports.default = createReportActionContextMenuStyleUtils;
