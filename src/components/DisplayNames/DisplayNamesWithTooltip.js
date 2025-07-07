"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils_1 = require("@libs/ReportUtils");
var DisplayNamesTooltipItem_1 = require("./DisplayNamesTooltipItem");
function DisplayNamesWithToolTip(_a) {
    var _b, _c;
    var shouldUseFullTitle = _a.shouldUseFullTitle, fullTitle = _a.fullTitle, displayNamesWithTooltips = _a.displayNamesWithTooltips, _d = _a.shouldAddEllipsis, shouldAddEllipsis = _d === void 0 ? false : _d, _e = _a.textStyles, textStyles = _e === void 0 ? [] : _e, _f = _a.numberOfLines, numberOfLines = _f === void 0 ? 1 : _f, renderAdditionalText = _a.renderAdditionalText;
    var styles = (0, useThemeStyles_1.default)();
    var containerRef = (0, react_1.useRef)(null);
    var childRefs = (0, react_1.useRef)([]);
    // eslint-disable-next-line react-compiler/react-compiler
    var isEllipsisActive = !!((_b = containerRef.current) === null || _b === void 0 ? void 0 : _b.offsetWidth) && !!((_c = containerRef.current) === null || _c === void 0 ? void 0 : _c.scrollWidth) && containerRef.current.offsetWidth < containerRef.current.scrollWidth;
    /**
     * We may need to shift the Tooltip horizontally as some of the inline text wraps well with ellipsis,
     * but their container node overflows the parent view which causes the tooltip to be misplaced.
     *
     * So we shift it by calculating it as follows:
     * 1. We get the container layout and take the Child inline text node.
     * 2. Now we get the tooltip original position.
     * 3. If inline node's right edge is overflowing the container's right edge, we set the tooltip to the center
     * of the distance between the left edge of the inline node and right edge of the container.
     * @param index Used to get the Ref to the node at the current index
     * @returns Distance to shift the tooltip horizontally
     */
    var getTooltipShiftX = (0, react_1.useCallback)(function (index) {
        var _a, _b;
        // Only shift the tooltip in case the containerLayout or Refs to the text node are available
        if (!containerRef.current || index < 0 || !childRefs.current.at(index)) {
            return 0;
        }
        var _c = containerRef.current.getBoundingClientRect(), containerWidth = _c.width, containerLeft = _c.left;
        // We have to return the value as Number so we can't use `measureWindow` which takes a callback
        var _d = (_b = (_a = childRefs.current.at(index)) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect()) !== null && _b !== void 0 ? _b : { width: 0, left: 0 }, textNodeWidth = _d.width, textNodeLeft = _d.left;
        var tooltipX = textNodeWidth / 2 + textNodeLeft;
        var containerRight = containerWidth + containerLeft;
        var textNodeRight = textNodeWidth + textNodeLeft;
        var newToolX = textNodeLeft + (containerRight - textNodeLeft) / 2;
        // When text right end is beyond the Container right end
        return textNodeRight > containerRight ? -(tooltipX - newToolX) : 0;
    }, []);
    return (
    // Tokenization of string only support prop numberOfLines on Web
    <Text_1.default style={[textStyles, styles.pRelative]} numberOfLines={numberOfLines || undefined} ref={containerRef} testID={DisplayNamesWithToolTip.displayName}>
            {shouldUseFullTitle
            ? (0, ReportUtils_1.formatReportLastMessageText)(fullTitle)
            : displayNamesWithTooltips === null || displayNamesWithTooltips === void 0 ? void 0 : displayNamesWithTooltips.map(function (_a, index) {
                var displayName = _a.displayName, accountID = _a.accountID, avatar = _a.avatar, login = _a.login;
                return (
                // eslint-disable-next-line react/no-array-index-key
                <react_1.Fragment key={index}>
                          <DisplayNamesTooltipItem_1.default index={index} getTooltipShiftX={getTooltipShiftX} accountID={accountID} displayName={displayName} login={login} avatar={avatar} textStyles={textStyles} childRefs={childRefs}/>
                          {index < displayNamesWithTooltips.length - 1 && <Text_1.default style={textStyles}>,&nbsp;</Text_1.default>}
                          {shouldAddEllipsis && index === displayNamesWithTooltips.length - 1 && <Text_1.default style={textStyles}>...</Text_1.default>}
                      </react_1.Fragment>);
            })}
            {renderAdditionalText === null || renderAdditionalText === void 0 ? void 0 : renderAdditionalText()}
            {!!isEllipsisActive && (<react_native_1.View style={styles.displayNameTooltipEllipsis}>
                    <Tooltip_1.default text={fullTitle}>
                        {/* There is some Gap for real ellipsis so we are adding 4 `.` to cover */}
                        <Text_1.default>....</Text_1.default>
                    </Tooltip_1.default>
                </react_native_1.View>)}
        </Text_1.default>);
}
DisplayNamesWithToolTip.displayName = 'DisplayNamesWithTooltip';
exports.default = DisplayNamesWithToolTip;
